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
  replyTo?: string;
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
      ...(options.replyTo && { replyTo: options.replyTo }),
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

/**
 * Send contact form submission email
 */
export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const contactEmail = process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || 'hello@devmultiplier.com';

  const subject = `Contact Form: ${data.subject}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #4b5563; }
        .message-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563eb; }
        .footer { color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📬 New Contact Form Submission</h2>
        </div>
        <div class="content">
          <p>You have received a new message from the Dev Academy contact form.</p>

          <div class="details">
            <div class="detail-row">
              <span class="label">Name:</span> ${data.name}
            </div>
            <div class="detail-row">
              <span class="label">Email:</span> <a href="mailto:${data.email}">${data.email}</a>
            </div>
            <div class="detail-row">
              <span class="label">Subject:</span> ${data.subject}
            </div>
          </div>

          <h3>Message:</h3>
          <div class="message-box">
            ${data.message.replace(/\n/g, '<br>')}
          </div>

          <div class="footer">
            <p>This message was sent via the Dev Academy contact form.</p>
            <p>Reply directly to this email to respond to ${data.name}.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Contact Form Submission - Dev Academy

From: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

---
Reply directly to this email to respond to ${data.name}.
  `;

  await sendEmail({
    to: contactEmail,
    subject,
    html,
    text,
    type: 'contact_form',
    replyTo: data.email,
  });
}

export async function sendEmailChangeVerification(
  newEmail: string,
  currentEmail: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email-change?token=${token}`;

  const subject = 'Verify Your New Email Address - Dev Academy';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 24px;
            border-bottom: 2px solid #f0f0f0;
          }
          .content {
            padding: 24px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .info-box {
            background: #f9fafb;
            border-left: 4px solid #2563eb;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding-top: 24px;
            border-top: 2px solid #f0f0f0;
            color: #666;
            font-size: 14px;
          }
          .warning {
            color: #dc2626;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #2563eb; margin: 0;">Dev Academy</h1>
            <p style="color: #666; margin: 8px 0 0 0;">Email Change Verification</p>
          </div>
          
          <div class="content">
            <h2>Verify Your New Email Address</h2>
            <p>You requested to change your email address on your Dev Academy account.</p>
            
            <div class="info-box">
              <p style="margin: 0;"><strong>Current Email:</strong> ${currentEmail}</p>
              <p style="margin: 8px 0 0 0;"><strong>New Email:</strong> ${newEmail}</p>
            </div>
            
            <p>To complete this change, please click the button below to verify your new email address:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify New Email Address</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p class="warning">⚠️ Important:</p>
            <ul>
              <li>This link will expire in 24 hours</li>
              <li>If you didn't request this change, please ignore this email and secure your account</li>
              <li>After verification, you'll need to log in with your new email address</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${newEmail} because a request was made to change the email address on your Dev Academy account.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; ${new Date().getFullYear()} Dev Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Verify Your New Email Address - Dev Academy

You requested to change your email address on your Dev Academy account.

Current Email: ${currentEmail}
New Email: ${newEmail}

To complete this change, please visit the following link to verify your new email address:
${verificationUrl}

⚠️ Important:
- This link will expire in 24 hours
- If you didn't request this change, please ignore this email and secure your account
- After verification, you'll need to log in with your new email address

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} Dev Academy. All rights reserved.
  `;

  await sendEmail({ to: newEmail, subject, html, text, type: 'email_change_verification' });
}
