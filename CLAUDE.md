# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevMultiplier Academy is a Next.js 16 course platform website with authentication, course management, and learning progress tracking. Uses Bun as the primary runtime and package manager.

## Common Commands

```bash
# Development
bun run dev              # Start dev server at localhost:3000
bun run build            # Production build (runs prisma generate first)
bun run type-check       # TypeScript type checking

# Testing
bun test                 # Run unit tests (Vitest)
bun test src/lib/__tests__/utils.test.ts  # Run single test file
bun run test:watch       # Watch mode
bun run test:coverage    # Coverage report
bun run e2e              # Run Playwright e2e tests
bun run e2e:headed       # E2e tests with browser visible

# Code Quality
bun run lint             # ESLint check
bun run lint:fix         # ESLint with auto-fix
bun run format           # Prettier check
bun run format:fix       # Prettier with auto-fix
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Runtime**: Bun (Node.js 22 compatible)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5 (credentials + OAuth: GitHub, Google, Microsoft, LinkedIn)
- **Styling**: Tailwind CSS v4
- **i18n**: next-intl for internationalization
- **Testing**: Vitest (unit), Playwright (e2e)

### Directory Structure

```
📦 /
├── 📄 middleware.ts              # Root middleware (auth + metrics)
├── 📄 instrumentation.ts         # OpenTelemetry setup entry point
├── 📁 prisma/
│   └── 📄 schema.prisma          # Database schema
└── 📁 src/
    ├── 📄 auth.ts                # NextAuth configuration
    ├── 📁 app/                   # Next.js App Router
    │   ├── 📁 (auth)/            # Auth pages (login, register, forgot-password)
    │   ├── 📁 (protected)/       # Protected pages (dashboard, profile, admin)
    │   └── 📁 api/               # API routes
    ├── 📁 components/
    │   ├── 📁 layout/            # Header, Footer, LayoutWrapper
    │   ├── 📁 sections/          # Hero, Courses, Pricing, CTA
    │   └── 📁 ui/                # Reusable components (Button, etc.)
    ├── 📁 lib/                   # Utilities and services
    │   ├── 📄 prisma.ts          # Prisma client singleton
    │   ├── 📄 metrics.ts         # OpenTelemetry metrics helpers
    │   ├── 📄 email-service.ts   # Resend email integration
    │   ├── 📄 login-logger.ts    # Login attempt logging
    │   └── 📄 session-tracker.ts # Session validation
    └── 📁 generated/prisma/      # Generated Prisma client (do not edit)
```

**Legend:**
- 📦 Project root
- 📁 Directory
- 📄 File

### Key Patterns

**Route Groups**: `(auth)` and `(protected)` group related routes with shared layouts.

**API Routes**: Follow REST conventions in `src/app/api/`. Each route exports handlers like `GET`, `POST`, `PUT`, `DELETE`.

**Authentication**: JWT-based sessions via NextAuth v5. Protected routes (`/dashboard`, `/courses`, `/profile`, `/enrollments`) check `authjs.session-token` cookie in root `middleware.ts`. Session tracking validates active sessions in the JWT callback.

**Database**: Prisma with PostgreSQL. Models include users, courses, modules, lessons, enrollments, and progress tracking. All content supports i18n via `*_translations` tables (course_translations, module_translations, lesson_translations).

**Observability**: OpenTelemetry instrumentation via `instrumentation.ts` (loads `instrumentation.node.ts` server-side). Metrics recorded for HTTP requests and page views in middleware.

### Path Alias
Use `@/` to import from `src/`:
```typescript
import { prisma } from '@/lib/prisma';
```

## Database

```bash
# Connection (in devcontainer)
psql -h postgres -U devuser -d devdb

# Prisma commands
bunx prisma generate       # Generate client after schema changes
bunx prisma db push        # Push schema to database
bunx prisma studio         # Open database browser
```

Schema location: `prisma/schema.prisma`
Generated client: `src/generated/prisma/`

## Environment Variables

Required variables (see `.env` for full list):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth secret (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Base URL for auth callbacks
- OAuth credentials for GitHub, Google, Microsoft, LinkedIn (optional)
- `RESEND_API_KEY` - For email sending (optional)

## Testing Conventions

- Unit tests: `src/**/__tests__/*.test.{ts,tsx}` or `src/**/*.{test,spec}.{ts,tsx}`
- E2e tests: `e2e/` directory
- Test environment: happy-dom
- Coverage thresholds: 70% for lines, functions, branches, statements

## Error Handling & Logging Standards

**IMPORTANT**: All code must use structured error handling and logging. Never use raw `console.log/error`.

### Loggers (from `@/lib/logger`)
```typescript
import { apiLogger, dbLogger, authLogger, cacheLogger, emailLogger } from '@/lib/logger';

// Use module-specific loggers
apiLogger.info({ userId, courseId }, 'User enrolled in course');
dbLogger.debug({ query, duration }, 'Query executed');
authLogger.warn({ code: 'CredentialsSignin' }, 'Failed login attempt');
```

### API Routes - Use `withErrorHandling` wrapper
```typescript
import { withErrorHandling } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, ValidationError } from '@/lib/errors';

export const GET = withErrorHandling(
  async (req: NextRequest) => {
    // Throw typed errors - they're automatically handled
    if (!session) throw new AuthenticationError();
    if (!resource) throw new NotFoundError('Course', id);

    return NextResponse.json(data);
  },
  { route: '/api/my-route' }
);
```

### Error Classes (from `@/lib/errors`)
| Error Class | HTTP Status | Use Case |
|-------------|-------------|----------|
| `ValidationError` | 400 | Invalid input, Zod failures |
| `AuthenticationError` | 401 | Not logged in |
| `AuthorizationError` | 403 | No permission |
| `NotFoundError` | 404 | Resource doesn't exist |
| `ConflictError` | 409 | Duplicate, already exists |
| `RateLimitError` | 429 | Too many requests |
| `ExternalServiceError` | 502 | Third-party API failures |

### Expected vs Unexpected Errors
- **Expected errors** (wrong password, not found): Log as `warn`, return clean message
- **Unexpected errors** (DB down, null pointer): Log as `error` with stack trace

### Third-Party Library Logging
Configure custom loggers for libraries (like NextAuth):
```typescript
logger: {
  error(code, ...message) {
    if (code.name === 'CredentialsSignin') {
      authLogger.warn({ code: 'CredentialsSignin' }, 'Failed login attempt');
    } else {
      authLogger.error({ err: code }, 'Auth error');
    }
  },
}
```

### Observability Stack
- **Logs** → Axiom (via `@/lib/logger` + `next-axiom`)
- **Metrics** → Grafana Cloud (via OpenTelemetry)
- **Traces** → Grafana Cloud (via OpenTelemetry)
- **Web Vitals** → Axiom (in production)
