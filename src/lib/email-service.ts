/**
 * Email service for sending security notifications
 *
 * This implementation uses console.log for demonstration.
 * In production, integrate with:
 * - Resend (https://resend.com)
 * - SendGrid (https://sendgrid.com)
 * - AWS SES (https://aws.amazon.com/ses/)
 * - Nodemailer with SMTP
 */

import { Resend } from 'resend';
import { recordEmailSent } from './metrics';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  type?: string;
}

// Resend email provider
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email
 * In production, replace this with actual email service integration
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const startTime = Date.now();
  let success = false;
  let errorType: string | undefined;

  try {
    // For development/demo: log to console
    if (process.env.RESEND_API_KEY == 'development') {
      console.log('=== EMAIL NOTIFICATION ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body:', options.text || options.html);
      console.log('==========================');
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'info@devmultiplier.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
    success = true;
  } catch (error) {
    console.error('Failed to send email:', error);
    errorType = error instanceof Error ? error.name : 'unknown_error';
    // Don't throw - email failures shouldn't break the app
  } finally {
    // Record email metrics
    recordEmailSent({
      type: options.type || 'general',
      recipient: options.to,
      success,
      duration: Date.now() - startTime,
      error: errorType,
    });
  }
}

/**
 * Send new login location notification
 */
export async function sendNewLocationAlert(
  email: string,
  name: string | null,
  location: {
    city?: string;
    region?: string;
    country?: string;
    ipAddress?: string;
  },
  timestamp: Date
): Promise<void> {
  const locationStr =
    [location.city, location.region, location.country].filter(Boolean).join(', ') || 'Unknown location';

  const subject = 'New login from a new location';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #4b5563; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .footer { color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔐 Security Alert</h2>
        </div>
        <div class="content">
          <p>Hi ${name || 'there'},</p>

          <p>We detected a login to your Dev Academy account from a new location.</p>

          <div class="details">
            <div class="detail-row">
              <span class="label">Location:</span> ${locationStr}
            </div>
            <div class="detail-row">
              <span class="label">IP Address:</span> ${location.ipAddress || 'Unknown'}
            </div>
            <div class="detail-row">
              <span class="label">Time:</span> ${timestamp.toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'long',
              })}
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ Was this you?</strong><br>
            If you don't recognize this login, please secure your account immediately by:
            <ul>
              <li>Changing your password</li>
              <li>Reviewing recent account activity</li>
              <li>Contacting support if needed</li>
            </ul>
          </div>

          <p>If this was you, you can safely ignore this email.</p>

          <div class="footer">
            <p>This is an automated security notification from Dev Academy.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Security Alert - New Login Detected

Hi ${name || 'there'},

We detected a login to your Dev Academy account from a new location.

Location: ${locationStr}
IP Address: ${location.ipAddress || 'Unknown'}
Time: ${timestamp.toLocaleString()}

Was this you?
If you don't recognize this login, please secure your account immediately by changing your password and reviewing recent account activity.

If this was you, you can safely ignore this email.

- Dev Academy Security Team
  `;

  await sendEmail({ to: email, subject, html, text, type: 'new_location_alert' });
}

/**
 * Send security alert for multiple failed login attempts
 */
export async function sendFailedLoginAlert(
  email: string,
  name: string | null,
  failedAttempts: number,
  location: {
    city?: string;
    region?: string;
    country?: string;
    ipAddress?: string;
  },
  timestamp: Date
): Promise<void> {
  const locationStr =
    [location.city, location.region, location.country].filter(Boolean).join(', ') || 'Unknown location';

  const subject = `🚨 Security Alert: ${failedAttempts} failed login attempts`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #4b5563; }
        .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
        .footer { color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🚨 Security Alert</h2>
        </div>
        <div class="content">
          <p>Hi ${name || 'there'},</p>

          <div class="alert">
            <strong>Multiple Failed Login Attempts Detected</strong><br>
            We detected ${failedAttempts} failed login attempts on your Dev Academy account.
          </div>

          <div class="details">
            <div class="detail-row">
              <span class="label">Failed Attempts:</span> ${failedAttempts}
            </div>
            <div class="detail-row">
              <span class="label">Location:</span> ${locationStr}
            </div>
            <div class="detail-row">
              <span class="label">IP Address:</span> ${location.ipAddress || 'Unknown'}
            </div>
            <div class="detail-row">
              <span class="label">Last Attempt:</span> ${timestamp.toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'long',
              })}
            </div>
          </div>

          <p><strong>What should you do?</strong></p>
          <ul>
            <li>If this was you, please try resetting your password if you've forgotten it</li>
            <li>If this wasn't you, your account may be under attack - change your password immediately</li>
            <li>Enable two-factor authentication for added security</li>
            <li>Contact support if you need assistance</li>
          </ul>

          <div class="footer">
            <p>This is an automated security notification from Dev Academy.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
🚨 SECURITY ALERT - Multiple Failed Login Attempts

Hi ${name || 'there'},

We detected ${failedAttempts} failed login attempts on your Dev Academy account.

Failed Attempts: ${failedAttempts}
Location: ${locationStr}
IP Address: ${location.ipAddress || 'Unknown'}
Last Attempt: ${timestamp.toLocaleString()}

What should you do?
- If this was you, please try resetting your password if you've forgotten it
- If this wasn't you, your account may be under attack - change your password immediately
- Enable two-factor authentication for added security
- Contact support if you need assistance

- Dev Academy Security Team
  `;

  await sendEmail({ to: email, subject, html, text, type: 'failed_login_alert' });
}
