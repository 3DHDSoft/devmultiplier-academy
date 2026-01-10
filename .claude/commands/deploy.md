# Deploy

Prepare and execute deployment for the DevMultiplier Academy application.

## Instructions

You are preparing a deployment. Follow these steps to ensure a safe, successful release.

### Step 1: Pre-Deployment Checks

Run all quality checks before deploying:

```bash
# 1. Ensure clean working directory
git status

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies
bun install

# 4. Generate Prisma client
bunx prisma generate

# 5. Type checking
bun run type-check

# 6. Linting
bun run lint

# 7. Run unit tests
bun test

# 8. Run e2e tests (optional but recommended)
bun run e2e

# 9. Production build
bun run build
```

**All checks must pass before proceeding.**

### Step 2: Environment Verification

Verify required environment variables are set in production:

#### Required Variables
```bash
# Database
DATABASE_URL          # PostgreSQL connection string

# Authentication
NEXTAUTH_SECRET       # Auth secret (openssl rand -base64 32)
NEXTAUTH_URL          # Production URL (e.g., https://devmultiplier.com)

# OAuth Providers (if enabled)
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET

# Email (if enabled)
RESEND_API_KEY

# Observability (if enabled)
OTEL_EXPORTER_OTLP_ENDPOINT
```

### Step 3: Database Migration

If schema changes are included:

```bash
# Review pending migrations
bunx prisma migrate status

# Apply migrations to production (use with caution)
bunx prisma migrate deploy

# Or for non-breaking changes in development
bunx prisma db push
```

**Warning**: Always backup the database before migrations.

### Step 4: Deployment Options

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI if needed
bun add -g vercel

# Preview deployment
vercel

# Production deployment
vercel --prod

# Or deploy via Git push (if Vercel is connected)
git push origin main
```

#### Option B: Docker

```bash
# Build production image
docker build -t devmultiplier-academy:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  -e NEXTAUTH_URL="$NEXTAUTH_URL" \
  devmultiplier-academy:latest
```

#### Option C: Node.js Server

```bash
# Build the application
bun run build

# Start production server
bun run start

# Or with PM2 for process management
pm2 start bun --name "devmultiplier" -- run start
```

#### Option D: Platform-Specific

```bash
# Railway
railway up

# Render
# Push to connected Git branch

# Fly.io
fly deploy

# AWS Amplify
amplify publish
```

### Step 5: Post-Deployment Verification

After deployment, verify the application:

```bash
# 1. Check application health
curl -I https://your-domain.com

# 2. Verify API endpoints
curl https://your-domain.com/api/health

# 3. Check authentication flow
# - Navigate to /login
# - Test OAuth providers
# - Test credentials login

# 4. Verify database connectivity
# - Check courses load on homepage
# - Test user registration

# 5. Monitor logs for errors
vercel logs --follow  # For Vercel
# Or check your platform's log viewer
```

### Step 6: Rollback Plan

If issues are detected:

```bash
# Vercel: Instant rollback to previous deployment
vercel rollback

# Git: Revert to previous commit
git revert HEAD
git push origin main

# Database: Restore from backup
# (Platform-specific backup restore)
```

## Deployment Checklist

```markdown
### Pre-Deploy
- [ ] All tests passing (`bun test`)
- [ ] Type check passing (`bun run type-check`)
- [ ] Lint check passing (`bun run lint`)
- [ ] Build succeeds (`bun run build`)
- [ ] No console errors in dev
- [ ] Database migrations reviewed

### Environment
- [ ] Production env vars configured
- [ ] Secrets rotated if needed
- [ ] OAuth redirect URIs updated for production domain

### Database
- [ ] Database backup created
- [ ] Migrations tested on staging
- [ ] No breaking schema changes (or migration plan ready)

### Post-Deploy
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] No errors in logs
- [ ] Monitoring/alerts configured
```

## Usage Examples

```bash
# Full deployment workflow
/deploy

# Pre-deployment checks only
/deploy check

# Specific platform
/deploy vercel
/deploy docker

# Rollback
/deploy rollback
```

## Common Issues

### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules bun.lockb
bun install

# Rebuild
bun run build
```

### Database Connection Issues
```bash
# Test connection
bunx prisma db pull

# Regenerate client
bunx prisma generate
```

### Environment Variable Issues
```bash
# Verify vars are set (don't log values)
echo "DATABASE_URL is ${DATABASE_URL:+set}"
echo "NEXTAUTH_SECRET is ${NEXTAUTH_SECRET:+set}"
```

## Production Configuration

### Recommended Headers (next.config.ts)
- Security headers (CSP, HSTS, X-Frame-Options)
- Cache headers for static assets

### Performance
- Enable compression
- Configure CDN for static assets
- Set appropriate cache policies

### Monitoring
- OpenTelemetry metrics enabled
- Error tracking configured
- Uptime monitoring set up
