# Password Reset Feature

This document describes the password reset functionality implemented in the Dev X Academy application.

## Overview

The password reset feature allows users to securely reset their passwords via email verification. The implementation follows security best practices including:

- Secure random token generation
- Token expiration (1 hour)
- One-time use tokens
- Email enumeration prevention
- Secure password hashing with bcrypt

## Database Schema

### password_reset_tokens Table

```sql
CREATE TABLE password_reset_tokens (
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  email     VARCHAR NOT NULL,
  token     VARCHAR UNIQUE NOT NULL,
  expires   TIMESTAMP NOT NULL,
  used      BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

Indexes on: `email`, `token`, `expires`

## API Endpoints

### 1. Request Password Reset

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (Always 200):**

```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Notes:**

- Always returns success to prevent email enumeration
- Only sends email if user exists and account is active
- Invalidates any existing unused tokens for the same email
- Token expires in 1 hour

### 2. Verify Token

**Endpoint:** `GET /api/auth/reset-password?token={token}`

**Response (Valid Token):**

```json
{
  "valid": true,
  "email": "user@example.com"
}
```

**Response (Invalid Token):**

```json
{
  "valid": false,
  "error": "Invalid token|Token already used|Token expired"
}
```

### 3. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**

```json
{
  "token": "abc123...",
  "password": "newpassword123"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Response (Error):**

```json
{
  "error": "Invalid or expired reset token|This reset link has already been used|..."
}
```

## User Flow

### 1. Forgot Password Page

**URL:** `/forgot-password`

Users enter their email address to request a password reset link.

**Features:**

- Email validation
- Success message (without revealing if account exists)
- Link back to login page
- Option to send another reset link

### 2. Email

Users receive an email with:

- Personalized greeting
- Clear call-to-action button
- Plain text link as fallback
- Expiration warning (1 hour)
- Security notice

**Email Template:** Included in `/api/auth/forgot-password/route.ts`

### 3. Reset Password Page

**URL:** `/reset-password?token={token}`

Users create a new password after clicking the email link.

**Features:**

- Automatic token validation on page load
- Loading state during validation
- Password strength requirements (min 8 characters)
- Password confirmation field
- Real-time validation
- Success message with auto-redirect to login
- Error handling for invalid/expired tokens

## Security Features

### 1. Token Security

- Cryptographically secure random tokens (32 bytes, hex encoded)
- One-time use enforcement
- 1-hour expiration
- Automatic invalidation of old tokens

### 2. Email Enumeration Prevention

- Same response for existing and non-existing emails
- No indication of whether an account exists

### 3. Rate Limiting

Consider adding rate limiting to prevent abuse:

- Limit reset requests per IP address
- Limit reset requests per email address

### 4. Password Security

- Minimum 8 characters enforced
- Bcrypt hashing with salt rounds (10)
- Client-side and server-side validation

## Configuration

### Environment Variables

Required in `.env.local`:

```bash
# Resend API Configuration
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=info@yourdomain.com

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Email Service (Resend)

The feature uses [Resend](https://resend.com) for email delivery. To set up:

1. Create a Resend account
2. Get your API key
3. Add the API key to `.env.local`
4. Verify your sending domain (for production)

## Testing

### Manual Testing

1. **Request Password Reset**

   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. **Check Email**
   - Check inbox for reset email
   - Click the reset link or copy the token

3. **Verify Token**

   ```bash
   curl "http://localhost:3000/api/auth/reset-password?token=YOUR_TOKEN"
   ```

4. **Reset Password**
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"YOUR_TOKEN","password":"newpassword123"}'
   ```

### Using the Script

You can also use the password reset script for testing:

```bash
bun scripts/reset-password.ts user@example.com newpassword
```

## Database Maintenance

### Clean Up Expired Tokens

Run periodically to remove old tokens:

```sql
DELETE FROM password_reset_tokens
WHERE expires < NOW() OR used = TRUE;
```

Consider setting up a cron job or database trigger for automatic cleanup.

## UI Pages

1. **Login Page** - [/apps/web/src/app/(auth)/login/page.tsx](</apps/web/src/app/(auth)/login/page.tsx>)
   - Contains "Forgot password?" link

2. **Forgot Password Page** - [/apps/web/src/app/(auth)/forgot-password/page.tsx](</apps/web/src/app/(auth)/forgot-password/page.tsx>)
   - Email input form
   - Success/error messaging

3. **Reset Password Page** - [/apps/web/src/app/(auth)/reset-password/page.tsx](</apps/web/src/app/(auth)/reset-password/page.tsx>)
   - Token validation
   - New password form
   - Password confirmation

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is correct
2. Verify `RESEND_FROM_EMAIL` is set
3. Check Resend dashboard for delivery status
4. For production, ensure domain is verified

### Token Validation Fails

1. Check token hasn't expired (1 hour limit)
2. Verify token hasn't been used already
3. Ensure database connection is working
4. Check for typos in the token parameter

### User Can't Reset Password

1. Verify user account exists and is active
2. Check user's email is correct in database
3. Review server logs for errors
4. Confirm NEXTAUTH_URL matches your domain

## Future Enhancements

Potential improvements:

1. **Rate Limiting**
   - Implement IP-based rate limiting
   - Add CAPTCHA for repeated requests

2. **Security Notifications**
   - Email notification when password is changed
   - Log password change events

3. **Password Requirements**
   - Add complexity requirements (uppercase, numbers, symbols)
   - Check against common password lists
   - Prevent password reuse

4. **Multi-language Support**
   - Translate email templates
   - Use user's preferred locale

5. **Admin Dashboard**
   - View password reset requests
   - Monitor suspicious activity
   - Manually expire tokens

## Related Files

- Database Schema: [apps/web/prisma/schema.prisma](../apps/web/prisma/schema.prisma)
- Forgot Password API: [apps/web/apps/web/src/app/api/auth/forgot-password/route.ts](../apps/web/apps/web/src/app/api/auth/forgot-password/route.ts)
- Reset Password API: [apps/web/apps/web/src/app/api/auth/reset-password/route.ts](../apps/web/apps/web/src/app/api/auth/reset-password/route.ts)
- Forgot Password Page: [apps/web/apps/web/src/app/(auth)/forgot-password/page.tsx](<../apps/web/apps/web/src/app/(auth)/forgot-password/page.tsx>)
- Reset Password Page: [apps/web/apps/web/src/app/(auth)/reset-password/page.tsx](<../apps/web/apps/web/src/app/(auth)/reset-password/page.tsx>)
- Login Page: [apps/web/apps/web/src/app/(auth)/login/page.tsx](<../apps/web/apps/web/src/app/(auth)/login/page.tsx>)

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
