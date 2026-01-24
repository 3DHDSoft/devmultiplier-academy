# Database Setup Guide

This guide covers setting up PostgreSQL for local development and cloud (Vercel Neon) environments.

## Environment Overview

| Environment    | Database                | OTel                 | Config Location  |
| -------------- | ----------------------- | -------------------- | ---------------- |
| **Local Dev**  | Local Postgres (Docker) | Local OTel Collector | `.env.local`     |
| **Preview**    | Vercel Neon             | Grafana Cloud        | Vercel Dashboard |
| **Production** | Vercel Neon             | Grafana Cloud        | Vercel Dashboard |

## Environment Files

| File                | Purpose                                 | Git       |
| ------------------- | --------------------------------------- | --------- |
| `.env`              | Template with placeholders (no secrets) | Committed |
| `.env.local`        | Local development secrets               | Ignored   |
| `.env.vercel.cloud` | Cloud migration reference               | Ignored   |
| `.env.vercel.local` | Pulled from Vercel (auto-generated)     | Ignored   |

---

## Local Development Setup

### Prerequisites

- Docker & Docker Compose (via devcontainer)
- Node.js 20+ or Bun

### Database Connection

The local PostgreSQL runs in Docker. Connection details:

```
Host:     postgres (inside devcontainer)
Port:     5432
Database: academy
User:     admin
Password: academy2026
```

Connection string (inside devcontainer):

```
DATABASE_URL="postgresql://admin:academy2026@postgres:5432/academy"
```

### Running Migrations (Local)

```bash
# Create a new migration
bun prisma migrate dev --name <migration-name>

# Apply migrations
bun prisma migrate dev

# Generate Prisma client
bun prisma generate
```

---

## Cloud Setup (Vercel Neon)

### Connection Details

```
Host (unpooled): ep-aged-bar-ahbjhuve.c-3.us-east-1.aws.neon.tech
Host (pooled):   ep-aged-bar-ahbjhuve-pooler.c-3.us-east-1.aws.neon.tech
Port:            5432
Database:        neondb
User:            neondb_owner
Password:        [pw]
SSL:             require
```

### When to Use Pooled vs Unpooled

| Use Case                         | Connection Type    |
| -------------------------------- | ------------------ |
| Application queries (serverless) | Pooled (`-pooler`) |
| Prisma migrations                | Unpooled           |
| pgAdmin / database tools         | Unpooled           |

### Running Migrations (Cloud)

Use the unpooled connection for migrations:

```bash
# Option 1: Inline DATABASE_URL
DATABASE_URL="postgresql://neondb_owner:[pw]@[host]/neondb?sslmode=verify-full&channel_binding=require" bun prisma migrate deploy

# Option 2: Using dotenv-cli with .env.vercel.cloud
dotenv -e .env.vercel.cloud -- bun prisma migrate deploy
```

### Migration Workflow

1. **Develop locally** → Create migrations with `bun prisma migrate dev`
2. **Test locally** → Verify changes work
3. **Deploy to cloud** → Run `bun prisma migrate deploy` with cloud DATABASE_URL
4. **Vercel builds** → Optionally auto-run migrations in build command

---

## pgAdmin Setup (Connect to Neon)

### Step 1: Register New Server

Right-click **Servers** → **Register** → **Server**

### Step 2: General Tab

| Field | Value                         |
| ----- | ----------------------------- |
| Name  | `Vercel Neon (DevMultiplier)` |

### Step 3: Connection Tab

| Field                | Value                                              |
| -------------------- | -------------------------------------------------- |
| Host                 | `ep-aged-bar-ahbjhuve.c-3.us-east-1.aws.neon.tech` |
| Port                 | `5432`                                             |
| Maintenance database | `neondb`                                           |
| Username             | `neondb_owner`                                     |
| Password             | `[pw]`                                             |
| Save password        | Yes (optional)                                     |

### Step 4: SSL Tab

| Field    | Value     |
| -------- | --------- |
| SSL mode | `Require` |

### Step 5: Save

---

## Vercel Dashboard Configuration

### Environment Variables for Preview & Production

Navigate to: **Vercel Dashboard** → **Settings** → **Environment Variables**

The following are auto-configured by Neon connection:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `POSTGRES_*` variables

Add these manually:

| Variable                      | Value                                                  |
| ----------------------------- | ------------------------------------------------------ |
| `OTEL_USE_CLOUD`              | `true`                                                 |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `https://otlp-gateway-prod-us-east-3.grafana.net/otlp` |
| `OTEL_EXPORTER_OTLP_HEADERS`  | `Authorization=Basic <credentials>`                    |
| `NEXTAUTH_SECRET`             | Generate with `openssl rand -base64 32`                |
| `NEXTAUTH_URL`                | Your production URL                                    |
| OAuth secrets                 | Your provider secrets                                  |
| `RESEND_API_KEY`              | Your Resend API key                                    |

---

## Prisma Commands Reference

| Command                     | Purpose                                | Environment             |
| --------------------------- | -------------------------------------- | ----------------------- |
| `bun prisma migrate dev`    | Create & apply migrations              | Local only              |
| `bun prisma migrate deploy` | Apply existing migrations              | Cloud (production-safe) |
| `bun prisma db push`        | Quick schema sync (no migration files) | Dev only                |
| `bun prisma generate`       | Generate Prisma client                 | Any                     |
| `bun prisma studio`         | Open database GUI                      | Any                     |

---

## Troubleshooting

### "Can't reach database server"

- **Local**: Ensure Docker containers are running (`docker compose up -d`)
- **Cloud**: Check SSL mode is set to `require`

### "Migration failed" on cloud

- Use the **unpooled** connection URL (without `-pooler`)
- Ensure `sslmode=verify-full` is in the connection string

### Vercel build fails with database error

- Ensure all `DATABASE_URL` variables are set in Vercel Dashboard
- Check that migrations are applied before deployment
