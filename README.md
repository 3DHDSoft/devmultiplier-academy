# 3D HD Soft - DevMultiplier Academy

> **Course Series:** How to become a 10x - 100x developer in the age of AI **Website:**
> [www.DevMultiplier.com](https://www.DevMultiplier.com)

The official website for DevMultiplier Academy - helping developers become 10x-100x more effective in the age of AI.

## Quick Start

### Prerequisites

- **VS Code** with
  [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git**

### Getting Started

1. Clone the repository
2. Open in VS Code
3. When prompted, click **"Reopen in Container"** _(or run Command Palette → "Dev Containers: Reopen in Container")_
4. Wait for the container to build (~2-3 minutes first time)

That's it! Your environment is ready with:

- ✅ Bun & Node.js 22
- ✅ PostgreSQL 18 with sample DDD schemas
- ✅ All VS Code extensions pre-installed

### Local Development (without Docker)

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Runtime:** Bun (with Node.js 22 compatibility)
- **Database:** PostgreSQL 18
- **Hosting:** Vercel
- **Course Platform:** Podia

## Project Structure

```
src/
├── 📁 app/                    # Next.js App Router pages
│   ├── 📁 about/
│   ├── 📁 contact/
│   ├── 📁 courses/
│   ├── 📁 pricing/
│   ├── 📁 globals.css
│   ├── 📁 layout.tsx
│   └── 📁 page.tsx
├── 📁 components/
│   ├── 📁 layout/            # Header, Footer
│   ├── 📁 sections/          # Page sections (Hero, Courses, etc.)
│   └── 📁 ui/                # Reusable UI components
└── 📁 lib/
    └── 📄 utils.ts           # Utility functions
```

## Environment Overview

### Runtimes & Tools

| Tool       | Version | Purpose                                       |
| ---------- | ------- | --------------------------------------------- |
| Bun        | Latest  | Primary runtime, package manager, test runner |
| Node.js    | 22 LTS  | Compatibility when needed                     |
| fnm        | Latest  | Node version management                       |
| Git        | Latest  | Version control                               |
| GitHub CLI | Latest  | GitHub integration                            |

### Databases

| Database          | Port | Credentials               | Connection String                                      |
| ----------------- | ---- | ------------------------- | ------------------------------------------------------ |
| **PostgreSQL 18** | 5433 | `devuser` / `devpassword` | `postgresql://devuser:devpassword@postgres:5432/devdb` |

### VS Code Extensions (Pre-installed)

**AI & Code Generation:**

- GitHub.copilot
- GitHub.copilot-chat
- anthropic.claude-code

**Development & Formatting:**

- dbaeumer.vscode-eslint
- esbenp.prettier-vscode
- bradlc.vscode-tailwindcss
- prisma.prisma
- humao.rest-client
- ms-vscode.vscode-typescript-next
- rvest.vs-code-prettier-eslint
- inferrinizzard.prettier-sql-vscode

**Database & SQL:**

- mtxr.sqltools (Multi-DB support)
- mtxr.sqltools-driver-pg (PostgreSQL)
- doublefint.pgsql
- bradymholt.pgformatter

**Git & Version Control:**

- eamodio.gitlens
- donjayamanne.git-extension-pack
- donjayamanne.githistory
- huizhou.githd
- github.vscode-github-actions
- github.vscode-pull-request-github
- codezombiech.gitignore
- ziyasal.vscode-open-in-github

**Markdown & Documentation:**

- bierner.github-markdown-preview
- bierner.markdown-checkbox
- bierner.markdown-emoji
- bierner.markdown-footnotes
- bierner.markdown-mermaid
- bierner.markdown-preview-github-styles
- bierner.markdown-yaml-preamble
- davidanson.vscode-markdownlint
- yzhang.markdown-all-in-one
- yzane.markdown-pdf
- mdickin.markdown-shortcuts
- shd101wyy.markdown-preview-enhanced
- goessner.mdmath

**Productivity & Tools:**

- alefragnani.project-manager
- mhutchie.git-graph
- moshfeu.compare-folders
- kisstkondoros.vscode-codemetrics

**Docker & DevOps:**

- ms-azuretools.vscode-docker
- docker.docker
- ms-azuretools.vscode-azureresourcegroups

**.NET & Web Development:**

- ms-dotnettools.csdevkit
- ms-dotnettools.csharp
- ms-windows-ai-studio.windows-ai-studio
- teamsdevapp.vscode-ai-foundry

**Data & Visualization:**

- mechatroner.rainbow-csv
- kumar-harsh.graphql-for-vscode
- mohsen1.prettify-json

**Configuration & Other:**

- redhat.vscode-yaml
- redhat.vscode-xml
- streetsidesoftware.code-spell-checker

## Sample Database Schema

Both databases include identical DDD-inspired schemas demonstrating:

### Bounded Contexts (as schemas)

```
├── 📁 Orders/
│   ├── 📁 Orders          (Aggregate Root)
│   ├── 📁 OrderItems      (Child Entity)
│   └── 📁 DomainEvents    (Event Store)
├── 📁 Inventory/
│   ├── 📁 Products        (Aggregate Root)
│   └── 📁 StockMovements  (Child Entity)
└── 📁 Customers/
    ├── 📁 Customers       (Aggregate Root)
    └── 📁 Addresses       (Value Object as table)
```

### Key DDD Patterns Demonstrated

1. **Aggregate Roots** - `Orders`, `Products`, `Customers`
2. **Child Entities** - Cascade delete, cannot exist without parent
3. **Value Objects** - `Addresses` stored as separate table but owned by Customer
4. **Domain Events** - JSON event storage for CQRS patterns
5. **Optimistic Concurrency** - Version columns for conflict detection

## Common Commands

### Development

```bash
# Start dev server
bun run dev

# Run tests
bun test

# Type checking
bun run typecheck

# Format code
bun run format
```

### Database CLI Access

```bash
# PostgreSQL
psql -h postgres -U devuser -d devdb
```

### Useful SQL Queries

**PostgreSQL - List all tables:**

```sql
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname IN ('orders', 'inventory', 'customers');
```

## Course Modules

This environment supports all courses in the series:

1. **From DDD to CQRS with AI Agents**
   - Domain modeling exercises
   - Event sourcing patterns
   - CQRS implementation

2. **DDD to Database Schema**
   - Schema design from domain models
   - Bounded context mapping
   - Sample schemas included

3. **AI-Assisted Database Optimization: SQL Server 2025 vs PostgreSQL 18**
   - Side-by-side query comparison
   - Performance tuning exercises
   - Query plan analysis

4. **Data-Driven REST API Development**
   - API scaffolding from schemas
   - OpenAPI generation
   - Testing strategies

5. **AI-Assisted UI Design and Implementation (Next.js)**
   - Component generation
   - Tailwind CSS styling
   - Full-stack integration

## Brand Colors

| Color      | Hex       | Usage             |
| ---------- | --------- | ----------------- |
| Navy       | `#0A1628` | Primary, text     |
| Blue       | `#3B82F6` | Accent, CTAs      |
| Cyan       | `#06B6D4` | Secondary accent  |
| Slate      | `#64748B` | Secondary text    |
| Light Gray | `#E2E8F0` | Borders, dividers |
| Off White  | `#F8FAFC` | Backgrounds       |

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
pg_isready -h postgres -U devuser -d devdb
```

### Port conflicts

If ports 5433 or 3000 are already in use:

1. Stop conflicting services
2. Or modify ports in `.devcontainer/docker-compose.yml`

## Deployment

The site auto-deploys to Vercel on push to the `main` branch.

### Custom Domain

1. Add `devmultiplier.com` in Vercel project settings
2. Update DNS in Cloudflare to point to Vercel

## Support

- **Course Website:** [www.DevMultiplier.com](https://www.DevMultiplier.com)
- **Issues:** Create an issue in the course repository

## License

© 2025 DevMultiplier Academy. A 3D HD Soft, LLC company. All rights reserved.

---

_DevMultiplier Academy - 3D HD Soft - DevMultiplier Academy_
