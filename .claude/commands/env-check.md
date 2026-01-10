# Environment Check

Validate environment variables and configuration.

## Instructions

Check that all required environment variables are properly configured.

### Step 1: Load Environment

```bash
# Check if .env exists
[ -f .env ] && echo "✅ .env file exists" || echo "❌ .env file missing"

# Check if .env.example exists
[ -f .env.example ] && echo "✅ .env.example exists" || echo "❌ .env.example missing"
```

### Step 2: Validate Required Variables

```bash
#!/bin/bash
# Environment validation script

echo "🔍 Checking environment variables..."
echo "=================================="

ERRORS=0

# Function to check variable
check_var() {
  local var_name=$1
  local required=$2
  local value="${!var_name}"

  if [ -z "$value" ]; then
    if [ "$required" = "required" ]; then
      echo "❌ $var_name: NOT SET (required)"
      ERRORS=$((ERRORS + 1))
    else
      echo "⚠️  $var_name: not set (optional)"
    fi
  else
    # Mask sensitive values
    if [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"PASSWORD"* ]] || [[ "$var_name" == *"KEY"* ]]; then
      echo "✅ $var_name: ****${value: -4}"
    else
      echo "✅ $var_name: ${value:0:50}..."
    fi
  fi
}

echo ""
echo "📦 Database"
check_var "DATABASE_URL" "required"

echo ""
echo "🔐 Authentication"
check_var "NEXTAUTH_SECRET" "required"
check_var "NEXTAUTH_URL" "required"

echo ""
echo "🔑 OAuth Providers"
check_var "GITHUB_CLIENT_ID" "optional"
check_var "GITHUB_CLIENT_SECRET" "optional"
check_var "GOOGLE_CLIENT_ID" "optional"
check_var "GOOGLE_CLIENT_SECRET" "optional"
check_var "MICROSOFT_CLIENT_ID" "optional"
check_var "MICROSOFT_CLIENT_SECRET" "optional"
check_var "LINKEDIN_CLIENT_ID" "optional"
check_var "LINKEDIN_CLIENT_SECRET" "optional"

echo ""
echo "📧 Email"
check_var "RESEND_API_KEY" "optional"

echo ""
echo "📊 Observability"
check_var "OTEL_EXPORTER_OTLP_ENDPOINT" "optional"

echo ""
echo "=================================="
if [ $ERRORS -eq 0 ]; then
  echo "✅ All required variables are set"
else
  echo "❌ $ERRORS required variable(s) missing"
  exit 1
fi
```

### Step 3: Validate Variable Values

#### Database URL Format

```bash
# Check DATABASE_URL format
if [[ "$DATABASE_URL" =~ ^postgresql:// ]]; then
  echo "✅ DATABASE_URL has correct protocol"
else
  echo "❌ DATABASE_URL should start with postgresql://"
fi

# Test database connection
bunx prisma db pull --force 2>/dev/null && echo "✅ Database connection successful" || echo "❌ Database connection failed"
```

#### NEXTAUTH_SECRET Strength

```bash
# Check secret length (should be at least 32 characters)
SECRET_LENGTH=${#NEXTAUTH_SECRET}
if [ $SECRET_LENGTH -ge 32 ]; then
  echo "✅ NEXTAUTH_SECRET is strong ($SECRET_LENGTH chars)"
else
  echo "⚠️  NEXTAUTH_SECRET is weak ($SECRET_LENGTH chars, recommend 32+)"
fi
```

#### URL Validation

```bash
# Check NEXTAUTH_URL format
if [[ "$NEXTAUTH_URL" =~ ^https?:// ]]; then
  echo "✅ NEXTAUTH_URL has valid protocol"
else
  echo "❌ NEXTAUTH_URL should be a full URL"
fi

# Warn if using localhost in production
if [[ "$NODE_ENV" == "production" ]] && [[ "$NEXTAUTH_URL" == *"localhost"* ]]; then
  echo "⚠️  NEXTAUTH_URL contains localhost in production"
fi
```

### Step 4: Check for Common Issues

#### Secrets in Git

```bash
# Check if .env is in .gitignore
if grep -q "^\.env$" .gitignore; then
  echo "✅ .env is in .gitignore"
else
  echo "❌ .env is NOT in .gitignore - add it immediately!"
fi

# Check for committed secrets
if git ls-files | xargs grep -l "NEXTAUTH_SECRET\|DATABASE_URL" 2>/dev/null | grep -v ".example\|.md\|.ts"; then
  echo "❌ Potential secrets found in tracked files!"
fi
```

#### Duplicate Variables

```bash
# Check for duplicate definitions
DUPLICATES=$(grep -oP "^[A-Z_]+=" .env | sort | uniq -d)
if [ -n "$DUPLICATES" ]; then
  echo "⚠️  Duplicate variables found: $DUPLICATES"
fi
```

### Step 5: Generate Missing Variables

```bash
# Generate NEXTAUTH_SECRET if missing
if [ -z "$NEXTAUTH_SECRET" ]; then
  NEW_SECRET=$(openssl rand -base64 32)
  echo "Generated NEXTAUTH_SECRET: $NEW_SECRET"
  echo "Add to .env: NEXTAUTH_SECRET=$NEW_SECRET"
fi
```

## Environment Templates

### Development (.env)

```bash
# Database
DATABASE_URL="postgresql://devuser:devpass@localhost:5432/devdb"

# Authentication
NEXTAUTH_SECRET="development-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional for development)
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
```

### Production (.env.production)

```bash
# Database (use connection pooling)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"

# Authentication (MUST be strong secret)
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="https://devmultiplier.com"

# OAuth
GITHUB_CLIENT_ID="<production-client-id>"
GITHUB_CLIENT_SECRET="<production-secret>"

# Email
RESEND_API_KEY="<production-key>"
```

## Validation Report

```markdown
## Environment Validation Report

### Summary
- **Environment**: development
- **Status**: ⚠️ 2 warnings
- **Checked**: 2024-01-10 10:30:00

### Required Variables

| Variable | Status | Value |
|----------|--------|-------|
| DATABASE_URL | ✅ | postgresql://...devdb |
| NEXTAUTH_SECRET | ✅ | ****abcd |
| NEXTAUTH_URL | ✅ | http://localhost:3000 |

### Optional Variables

| Variable | Status | Notes |
|----------|--------|-------|
| GITHUB_CLIENT_ID | ⚠️ Not set | GitHub OAuth disabled |
| GOOGLE_CLIENT_ID | ⚠️ Not set | Google OAuth disabled |
| RESEND_API_KEY | ⚠️ Not set | Email features disabled |

### Validation Checks

| Check | Status |
|-------|--------|
| .env exists | ✅ |
| .env in .gitignore | ✅ |
| No secrets in git | ✅ |
| Database connection | ✅ |
| Secret strength | ✅ |

### Recommendations

1. Set up OAuth providers for social login
2. Configure RESEND_API_KEY for email features
```

## Usage

```bash
# Run full environment check
/env-check

# Check specific category
/env-check database
/env-check auth
/env-check oauth

# Generate missing secrets
/env-check --generate

# Compare with .env.example
/env-check --compare
```
