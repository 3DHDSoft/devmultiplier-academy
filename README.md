# DevMultiplier Academy

> **Course Series:** How to become a 10x - 100x developer in the age of AI
> **Website:** [www.DevMultiplier.com](https://www.DevMultiplier.com)

The official website for DevMultiplier Academy - helping developers become 10x-100x more effective in the age of AI.

## Quick Start

### Prerequisites

- **VS Code** with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git**

### Getting Started

1. Clone the repository
2. Open in VS Code
3. When prompted, click **"Reopen in Container"** _(or run Command Palette → "Dev Containers: Reopen in Container")_
4. Wait for the container to build (~2-3 minutes first time)

That's it! Your environment is ready with:

- ✅ Bun & Node.js 22
- ✅ PostgreSQL 18
- ✅ All VS Code extensions pre-installed

### Local Development

```bash
# Install dependencies (from repo root)
bun install

# Run development server
cd apps/web
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Runtime:** Bun (with Node.js 22 compatibility)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth v5
- **Hosting:** Vercel

## Project Structure (Monorepo)

```
📦 /                              # Monorepo root
├── 📁 apps/
│   └── 📁 web/                   # Next.js website
│       ├── 📄 middleware.ts      # Auth + metrics middleware
│       ├── 📄 instrumentation.ts # OpenTelemetry setup
│       ├── 📁 prisma/
│       │   └── 📄 schema.prisma  # Database schema
│       ├── 📁 e2e/               # Playwright e2e tests
│       └── 📁 src/
│           ├── 📄 auth.ts        # NextAuth configuration
│           ├── 📁 app/           # Next.js App Router pages
│           ├── 📁 components/    # UI components
│           │   ├── 📁 layout/    # Header, Footer
│           │   ├── 📁 sections/  # Page sections (Hero, Pricing)
│           │   └── 📁 ui/        # Reusable UI components
│           ├── 📁 lib/           # Utilities and services
│           └── 📁 generated/     # Generated Prisma client
├── 📁 courses/
│   └── 📁 ddd-to-cqrs/           # Course: DDD to CQRS
│       ├── 📁 content/           # Lesson markdown files
│       │   ├── 📁 module-1/
│       │   ├── 📁 module-2/
│       │   └── ...
│       ├── 📁 code/              # Code snippets per lesson
│       │   └── 📁 module-1/
│       │       └── 📁 lesson-01/
│       │           ├── 📁 before/
│       │           └── 📁 after/
│       └── 📁 production/        # Video/audio production assets
├── 📁 packages/                  # Shared packages (future)
├── 📁 docs/                      # Project documentation
└── 📄 package.json               # Workspace root config
```

## Common Commands

All commands should be run from `apps/web/` unless otherwise noted.

### Development

```bash
cd apps/web

# Start dev server
bun run dev

# Production build
bun run build

# Type checking
bun run type-check

# Linting & formatting
bun run lint
bun run lint:fix
bun run format
bun run format:fix
```

### Testing

```bash
cd apps/web

# Unit tests (Vitest)
bun test
bun run test:watch
bun run test:coverage

# E2E tests (Playwright)
bun run e2e
bun run e2e:headed
```

### Database

```bash
cd apps/web

# Prisma commands
bunx prisma generate    # Generate client after schema changes
bunx prisma db push     # Push schema to database
bunx prisma studio      # Open database browser

# Direct PostgreSQL access
psql -h postgres -U admin -d academy
```

## Environment Overview

### Runtimes & Tools

| Tool       | Version | Purpose                                       |
| ---------- | ------- | --------------------------------------------- |
| Bun        | 1.3+    | Primary runtime, package manager, test runner |
| Node.js    | 22 LTS  | Compatibility when needed                     |
| Git        | Latest  | Version control                               |
| GitHub CLI | Latest  | GitHub integration                            |

### Local Database

| Database          | Port | Credentials             | Connection String                                        |
| ----------------- | ---- | ----------------------- | -------------------------------------------------------- |
| **PostgreSQL 18** | 5432 | `admin` / `academy2026` | `postgresql://admin:academy2026@postgres:5432/academy`   |

## Course Content Structure

Course content is stored in `/courses/{course-id}/`:

```
courses/ddd-to-cqrs/
├── content/              # Lesson markdown files
│   ├── module-1/
│   │   ├── lesson-0-genai-landscape.md
│   │   ├── lesson-1-what-is-ddd.md
│   │   ├── quiz-lesson-0.json
│   │   └── quiz-lesson-1.json
│   └── module-2/
│       └── ...
├── code/                 # Code examples
│   └── module-1/
│       └── lesson-01/
│           ├── before/   # Starting code
│           └── after/    # Completed code
└── production/           # Video production assets
    └── remotion/         # Remotion video projects
```

## Deployment

The site auto-deploys to Vercel on push to the `main` branch.

### Custom Domain

1. Add `devmultiplier.com` in Vercel project settings
2. Update DNS in Cloudflare to point to Vercel

## Troubleshooting

### Container won't start

```bash
# Check Docker status
docker ps -a

# View container logs
docker logs postgres-dev

# Rebuild from scratch
# In VS Code: Command Palette → "Dev Containers: Rebuild Container"
```

### Database connection issues

```bash
# Test PostgreSQL
pg_isready -h postgres -U admin -d academy
```

### Port conflicts

If ports 5432 or 3000 are already in use:

1. Stop conflicting services
2. Or modify ports in `.devcontainer/docker-compose.yml`

## Support

- **Course Website:** [www.DevMultiplier.com](https://www.DevMultiplier.com)
- **Issues:** Create an issue in the course repository

## License

© 2025-2026 DevMultiplier Academy. A 3D HD Soft, LLC company. All rights reserved.
