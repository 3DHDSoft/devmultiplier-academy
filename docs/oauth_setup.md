# OAuth Providers Setup Guide

This guide explains how to configure OAuth authentication providers for the Dev Academy application.

## Overview

The application now supports the following authentication methods:

- ✅ GitHub OAuth
- ✅ Google OAuth
- ✅ Microsoft Entra ID (Azure AD)
- ✅ LinkedIn OAuth
- ✅ Email/Password (Credentials)
- 🔜 Passkeys (Coming soon)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Microsoft Entra ID (Azure AD)
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
MICROSOFT_TENANT_ID="common"  # Use "common" for multi-tenant, or your specific tenant ID

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
```

## Provider Setup Instructions

### 1. GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Dev Academy
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**
6. Add to `.env.local`:
   ```bash
   GITHUB_CLIENT_ID="your-client-id-here"
   GITHUB_CLIENT_SECRET="your-client-secret-here"
   ```

**Production Setup:**

- Update Homepage URL to your production domain (e.g., `https://academy.example.com`)
- Update Authorization callback URL to `https://academy.example.com/api/auth/callback/github`

---

### 2. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - Add your app name, support email, and developer contact
6. For Application type, select **Web application**
7. Add Authorized JavaScript origins:
   - `http://localhost:3000`
8. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
9. Click **Create**
10. Copy the **Client ID** and **Client Secret**
11. Add to `.env.local`:
    ```bash
    GOOGLE_CLIENT_ID="your-client-id-here"
    GOOGLE_CLIENT_SECRET="your-client-secret-here"
    ```

**Production Setup:**

- Add production domain to Authorized JavaScript origins
- Add `https://academy.example.com/api/auth/callback/google` to Authorized redirect URIs

---

### 3. Microsoft Entra ID (Azure AD)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Microsoft Entra ID** → **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Dev Academy
   - **Supported account types**: Choose based on your needs
     - "Accounts in any organizational directory and personal Microsoft accounts" for public apps
   - **Redirect URI**: Select "Web" and enter `http://localhost:3000/api/auth/callback/microsoft-entra-id`
5. Click **Register**
6. Copy the **Application (client) ID** and **Directory (tenant) ID**
7. Go to **Certificates & secrets** → **Client secrets** → **New client secret**
8. Add a description and expiration, then click **Add**
9. Copy the **Value** (this is your client secret - save it now, you won't see it again!)
10. Add to `.env.local`:
    ```bash
    MICROSOFT_CLIENT_ID="your-application-client-id"
    MICROSOFT_CLIENT_SECRET="your-client-secret-value"
    MICROSOFT_TENANT_ID="your-tenant-id"  # Or use "common" for multi-tenant
    ```

**Production Setup:**

- Add `https://academy.example.com/api/auth/callback/microsoft-entra-id` to Redirect URIs

**Tenant Options:**

- `common` - Multi-tenant (work, school, and personal Microsoft accounts)
- `organizations` - Multi-tenant (work and school accounts only)
- `consumers` - Personal Microsoft accounts only
- `{tenant-id}` - Specific tenant only

---

### 4. LinkedIn OAuth

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create app**
3. Fill in the required information:
   - **App name**: Dev Academy
   - **LinkedIn Page**: Select or create a LinkedIn page
   - **Privacy policy URL**: Your privacy policy URL
   - **App logo**: Upload a logo (optional)
4. Click **Create app**
5. Navigate to the **Auth** tab
6. Under **OAuth 2.0 settings**:
   - Add Redirect URLs: `http://localhost:3000/api/auth/callback/linkedin`
7. Under **Products**, request access to:
   - **Sign In with LinkedIn using OpenID Connect**
8. Copy the **Client ID** and **Client Secret** from the Auth tab
9. Add to `.env.local`:
   ```bash
   LINKEDIN_CLIENT_ID="your-client-id-here"
   LINKEDIN_CLIENT_SECRET="your-client-secret-here"
   ```

**Production Setup:**

- Add `https://academy.example.com/api/auth/callback/linkedin` to Redirect URLs

**Required Scopes:**

- `openid`
- `profile`
- `email`

---

## Testing OAuth Providers

1. Start your development server:

   ```bash
   bun run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. You should see sign-in buttons for:
   - GitHub
   - Google
   - Microsoft
   - LinkedIn

4. Click any provider button to test the OAuth flow

5. After successful authentication, you'll be redirected to `/dashboard`

## Troubleshooting

### Common Issues

**"Redirect URI mismatch" error:**

- Ensure the callback URL in your OAuth app matches exactly: `http://localhost:3000/api/auth/callback/{provider}`
- Check for trailing slashes (should not have one)
- Verify HTTP vs HTTPS

**"Client ID or Secret invalid":**

- Double-check that environment variables are set correctly
- Restart your Next.js development server after adding new environment variables
- Ensure no extra spaces in the `.env.local` file

**"Access denied" or "Insufficient permissions":**

- Verify OAuth consent screen is configured (Google)
- Check that required scopes are requested (LinkedIn)
- Ensure your app is approved/published if required by the provider

**Session not persisting:**

- Check that `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again
- Verify database connection is working

### Debugging

Enable debug mode in NextAuth by adding to `.env.local`:

```bash
NEXTAUTH_DEBUG=true
```

Check logs in the terminal for detailed error messages.

## Database Schema

OAuth authentication automatically uses the existing `accounts` table:

```prisma
model accounts {
  id                String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String  @map("user_id") @db.Uuid
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  users users @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId], map: "provider_provider_account_id")
}
```

No database migrations are required - the schema is already in place!

## Security Considerations

1. **Never commit secrets to version control**
   - Keep `.env.local` in `.gitignore`
   - Use environment-specific secrets in production

2. **Use HTTPS in production**
   - All OAuth callbacks must use HTTPS
   - Update `NEXTAUTH_URL` to your HTTPS domain

3. **Rotate secrets regularly**
   - Generate new client secrets periodically
   - Update across all environments

4. **Limit OAuth scopes**
   - Only request the minimum permissions needed
   - Current implementation requests: profile, email

5. **Monitor OAuth applications**
   - Check provider dashboards for unusual activity
   - Review authorized users regularly

## Production Deployment

Before deploying to production:

1. Update all OAuth app configurations with production URLs
2. Set production environment variables in your hosting platform
3. Update `NEXTAUTH_URL` to your production domain
4. Ensure `NEXTAUTH_SECRET` is a strong, randomly generated value
5. Configure OAuth consent screens for public access
6. Test all OAuth flows in production environment

## Next Steps: Passkeys

Passkey authentication (WebAuthn) is planned for future implementation. This will provide:

- Passwordless authentication
- Biometric login (Face ID, Touch ID, Windows Hello)
- Enhanced security with public key cryptography
- Phishing-resistant authentication

Stay tuned for updates!

## Support

For issues or questions:

- Check the [NextAuth.js documentation](https://next-auth.js.org/)
- Review provider-specific OAuth documentation
- Open an issue in the project repository
