# Security Features Documentation

## Overview

This application includes comprehensive security monitoring and notification features for login activity.

## Features Implemented

### 1. Login History UI for Users

**Location:** `/security`

Users can view their recent login activity including:

- Success/failure status
- Location (city, region, country)
- IP address
- Timestamp
- Failure reasons (for failed attempts)

**Features:**

- Visual indicators for success (green) vs failed (red) attempts
- Current session highlighting
- Relative timestamps (e.g., "5 minutes ago")
- Security tips and best practices

### 2. Email Notifications for New Login Locations

**Implementation:** `apps/web/src/lib/email-service.ts` and `apps/web/apps/web/src/lib/login-logger.ts`

**How it works:**

- When a user logs in successfully, the system checks if this is the first login from that city/country combination
- If it's a new location, an email notification is sent with:
  - Location details
  - IP address
  - Timestamp
  - Security recommendations

**Email Template Features:**

- Professional HTML design
- Clear security warnings
- Actionable next steps

**Status:** ✅ **Fully configured with Resend** - Emails are being sent to real inboxes!

### 3. Security Alerts for Failed Login Attempts

**Implementation:** `apps/web/src/lib/email-service.ts` and `apps/web/apps/web/src/lib/login-logger.ts`

**How it works:**

- Monitors failed login attempts in a 15-minute window
- When 3 or more failed attempts are detected, sends a security alert email
- Prevents spam by only sending alerts on 3rd, 6th, 9th attempts, etc.

**Alert includes:**

- Number of failed attempts
- Location of attempts
- IP address
- Timestamp of last attempt
- Security recommendations

### 4. Admin Dashboard for Login Monitoring

**Location:** `/admin/logins`

**Access Control:**

- Protected by `requireAdmin()` middleware
- Returns 403 Forbidden for non-admin users

**Features:**

- **Statistics Dashboard:**
  - Total logins
  - Successful logins count
  - Failed logins count
  - Unique users count

- **Comprehensive Login Table:**
  - Status (success/failed)
  - User name and email
  - Location
  - IP address
  - Timestamp
  - Failure reasons
  - User agent information

- **Filtering and Search:**
  - Search by email, name, or IP address
  - Filter by status (all, success, failed)
  - Real-time filtering

- **Visual Indicators:**
  - Color-coded rows for failed attempts
  - Icons for quick status identification
  - Hover effects for better UX

## Database Schema

### User Model Updates

Added `isAdmin` field to User model:

```prisma
model User {
  // ... existing fields
  isAdmin       Boolean   @default(false)
  // ... rest of model
}
```

### LoginLog Model

```prisma
model LoginLog {
  id           String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  userId       String   @db.Uuid
  email        String
  ipAddress    String?
  userAgent    String?
  country      String?
  city         String?
  region       String?
  latitude     Float?
  longitude    Float?
  success      Boolean  @default(true)
  failureReason String?
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@index([ipAddress])
  @@map("login_logs")
}
```

## API Endpoints

### User Endpoints

#### GET `/api/user/login-history`

Returns login history for the authenticated user.

**Authentication:** Required (session)

**Response:**

```json
{
  "history": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "ipAddress": "192.168.1.1",
      "country": "United States",
      "city": "New York",
      "region": "New York",
      "success": true,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 20
}
```

### Admin Endpoints

#### GET `/api/admin/login-logs`

Returns all login attempts across the platform (last 100).

**Authentication:** Required (admin only)

**Response:**

```json
{
  "logs": [
    {
      "id": "uuid",
      "userId": "uuid",
      "email": "user@example.com",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "country": "United States",
      "city": "New York",
      "region": "New York",
      "success": true,
      "failureReason": null,
      "createdAt": "2024-01-01T12:00:00Z",
      "user": {
        "name": "John Doe",
        "status": "active"
      }
    }
  ],
  "stats": {
    "totalLogins": 100,
    "successfulLogins": 95,
    "failedLogins": 5,
    "uniqueUsers": 42
  },
  "total": 100
}
```

## Making a User an Admin

Since there's no UI for this yet, you need to update the database directly:

### Using Prisma Studio

```bash
bunx prisma studio
```

Then navigate to Users table and set `isAdmin` to `true` for desired users.

### Using SQL

```sql
UPDATE users SET "isAdmin" = true WHERE email = 'admin@example.com';
```

### Using Prisma Client

```typescript
await prisma.user.update({
  where: { email: 'admin@example.com' },
  data: { isAdmin: true },
});
```

## Security Configuration

### Failed Attempt Threshold

Currently set to 3 failed attempts in 15 minutes.

To modify, edit `apps/web/apps/web/src/lib/login-logger.ts`:

```typescript
const FAILED_ATTEMPT_THRESHOLD = 3; // Change this value
const fifteenMinutesAgo = new Date(timestamp.getTime() - 15 * 60 * 1000); // Change time window
```

### New Location Detection

Currently checks for matching city + country combination.

To make it stricter (country only) or looser (IP-based), modify `checkAndNotifyNewLocation()` in `apps/web/apps/web/src/lib/login-logger.ts`.

## Email Integration

### ✅ Resend - Already Configured!

Your application is already set up with Resend and ready to send emails:

- **API Key:** Configured in `.env.local`
- **From Email:** `info@devmultiplier.com` (verified domain)
- **Package:** `resend@^6.6.0` installed
- **Implementation:** Fully integrated in `apps/web/src/lib/email-service.ts`

**Test your email setup:**

```bash
bun scripts/test-email.ts your-email@example.com
```

This will send both types of security notifications to your inbox.

**Monitor your emails:**

- Resend Dashboard: https://resend.com/emails
- View delivery status, opens, and bounces

### Alternative Email Providers (if needed)

If you want to switch from Resend, see comments in `apps/web/src/lib/email-service.ts` for integration instructions with:

- SendGrid
- AWS SES
- Nodemailer (SMTP)

## Testing

### Quick Email Test (Recommended)

Test that emails are working correctly:

```bash
bun scripts/test-email.ts your-email@example.com
```

This sends both security notification types to your email. Check your inbox (and spam folder) within 1-2 minutes.

### Test New Location Alert (Live)

1. Login from your normal location
2. Use a VPN to connect from a different country
3. Login again
4. Check your email inbox for the new location alert

### Test Failed Login Alert (Live)

1. Attempt to login with wrong password 3 times within 15 minutes
2. Check your email inbox for the security alert

### Test Admin Dashboard

1. Make your user an admin: `bun scripts/make-admin.ts your-email@example.com`
2. Navigate to `/admin/logins`
3. View login statistics and logs
4. Test search and filtering

## Security Best Practices

1. **Rate Limiting:** Consider adding rate limiting to prevent brute force attacks
2. **Account Locking:** Implement temporary account locks after multiple failed attempts
3. **Two-Factor Authentication:** Add 2FA for enhanced security
4. **IP Whitelisting:** Allow users to whitelist trusted IPs
5. **Session Management:** Implement session timeout and concurrent session limits
6. **Password Policies:** Enforce strong password requirements
7. **Audit Logs:** Keep detailed logs of all security events

## Maintenance

### Database Cleanup

Login logs can grow large over time. Consider implementing automatic cleanup:

```typescript
// Delete logs older than 90 days
await prisma.loginLog.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
  },
});
```

Set this up as a cron job or scheduled task.

## Troubleshooting

### Emails not sending

1. Check console logs for email notifications
2. Verify email service configuration
3. Check API keys are correctly set
4. Verify domain/sender email is verified with provider

### Admin dashboard shows 403 Forbidden

1. Verify user has `isAdmin: true` in database
2. Check session is valid
3. Verify middleware is working correctly

### Location detection not working

1. Check if IP address is being captured correctly
2. Verify ip-api.com is accessible (or Cloudflare headers if using CF)
3. Check rate limits on ip-api.com (45 req/min)
4. Review console logs for geolocation errors

## Future Enhancements

Potential improvements to consider:

1. **Device Fingerprinting:** Track and recognize trusted devices
2. **Geofencing:** Alert for logins from specific geographic regions
3. **Risk Scoring:** Assign risk scores based on various factors
4. **User Preferences:** Let users configure notification settings
5. **Admin Actions:** Allow admins to block IPs or suspend accounts
6. **Export Functionality:** Export login logs to CSV/PDF
7. **Real-time Monitoring:** WebSocket-based live login feed
8. **Anomaly Detection:** ML-based detection of unusual patterns

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
