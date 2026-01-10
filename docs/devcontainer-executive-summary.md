# DevContainer Executive Overview - Dev-X-Academy-Web

## Core Purpose

This devcontainer transforms the **DevMultiplier Academy website** from a complex multi-service application requiring
hours of manual setup into a **one-click development environment**. It's specifically engineered for teaching and
developing a production-grade Next.js educational platform with enterprise-level observability.

---

## Why This DevContainer Exists

### Problem It Solves

Setting up this project traditionally requires:

- Installing Node.js 22 and Bun 1.3.5+
- Setting up PostgreSQL 18 with PostGIS extensions
- Configuring an entire observability stack (OpenTelemetry, Prometheus, Tempo, Grafana)
- Installing 50+ VS Code extensions
- Troubleshooting version conflicts across different operating systems

**Total time: 2-4 hours** (often more with issues)

### Solution

1. Open project in VS Code
2. Click "Reopen in Container"
3. Wait 5-10 minutes
4. Start coding with everything configured

**Time saved: ~3.5 hours per developer**

---

## Key Features

### 1. Complete Application Stack

| Component  | Version | Purpose              |
| ---------- | ------- | -------------------- |
| Node.js    | 22.x    | JavaScript runtime   |
| Bun        | 1.3.5+  | Fast package manager |
| Next.js    | 16.1.1  | React framework      |
| React      | 19.2.3  | UI library           |
| TypeScript | 5.x     | Type safety          |
| PostgreSQL | 18.1    | Primary database     |
| PostGIS    | 3.6     | Spatial extensions   |
| Prisma     | 7.2.0   | Database ORM         |

### 2. Enterprise Observability (Production-Grade Monitoring)

Complete monitoring stack that mirrors production:

**OpenTelemetry Collector**

- Receives traces and metrics from Next.js app
- Routes data to appropriate backends
- Ports: 4317 (gRPC), 4318 (HTTP)

**Grafana Tempo**

- Distributed tracing backend
- Query traces by ID or attributes
- Port: 3200

**Prometheus**

- Time-series metrics database
- Scrapes metrics every 15 seconds
- Port: 9090

**Grafana**

- Unified visualization platform
- 3 pre-built dashboards:
  - **Application Overview**: Request rates, response times, error rates
  - **Performance Metrics**: Detailed latency histograms, throughput
  - **Security Monitoring**: Authentication events, failed logins
- Port: 3001
- Credentials: admin/admin

**What This Means**: You can see exactly how your code performs in real-time, trace slow database queries, and monitor
security events—just like production systems.

### 3. 50+ Pre-installed VS Code Extensions

Carefully curated tools that install automatically:

**AI Assistants**

- Claude Code
- GitHub Copilot

**Testing**

- Playwright
- Vitest

**Git Tools**

- GitLens
- Git Graph
- Git History

**Database**

- PostgreSQL formatter
- SQLTools

**Documentation**

- 7 Markdown extensions with Mermaid diagrams

**Code Quality**

- ESLint
- Prettier
- Spell checker

### 4. Professional CLI Tools

- **GitHub CLI** (`gh`) - Manage PRs and issues from terminal
- **Vercel CLI** - Deploy with one command
- **Stripe CLI** - Test payment integrations locally
- **Tailwind CLI** - Standalone CSS processing
- **Oh My Zsh** - Enhanced terminal with themes

### 5. Automated Setup & Health Checks

Two lifecycle scripts ensure everything works:

- **post-create.sh**: Installs dependencies, waits for PostgreSQL, configures permissions
- **post-start.sh**: Verifies database connections on every restart

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────┐
│  Development Container (Ubuntu 24.04 + Node 22) │
│  - Your code workspace                          │
│  - Bun package manager                          │
│  - 50+ VS Code extensions                       │
│  - CLI tools (gh, vercel, stripe)               │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼───────┐    ┌──────▼──────────────────┐
│  Database     │    │  Observability Stack    │
│               │    │                         │
│  PostgreSQL   │    │  Next.js App (3000)     │
│  18 + PostGIS │    │       ↓                 │
│  (port 5433)  │    │  OTLP Collector (4318)  │
│               │    │       ↓                 │
│  pgAdmin      │    │  Tempo (traces)         │
│  (port 5051)  │    │  Prometheus (metrics)   │
└───────────────┘    │  Grafana (dashboards)   │
                     └─────────────────────────┘
```

---

## What Makes This DevContainer Special

### 1. Educational Platform Optimized

- Perfect for onboarding students/instructors instantly
- Everyone gets identical environments—no setup support tickets
- Teaches professional development practices (observability, testing, type safety)

### 2. Production Parity

- Observability stack mirrors production monitoring
- Same PostgreSQL version and extensions as production
- Pre-configured OpenTelemetry instrumentation

### 3. Zero Configuration

- Database credentials pre-set and working
- All services networked together automatically
- Health checks ensure services are ready before you start coding
- 14 ports auto-forwarded with smart notifications

### 4. Data Persistence

9 Docker volumes preserve your work across container rebuilds:

- Database data and backups
- Grafana dashboards you customize
- Claude Code authentication
- Dependency caches for faster rebuilds

### 5. Security Hardened

- Non-root user with sudo access
- SCRAM-SHA-256 password encryption
- Read-only configuration mounts
- Isolated Docker network

---

## Who Benefits Most

✅ **Educational Institutions**: Students get working environments in minutes ✅ **Development Teams**: 5+ developers
need consistency ✅ **Open Source Projects**: Contributors avoid setup friction ✅ **Remote Teams**: Works identically
locally or in GitHub Codespaces

---

## Resource Requirements

### What You Need

- **CPU**: 4 cores minimum (8 recommended)
- **Memory**: 20GB minimum (32GB recommended)
- **Disk**: 15GB free space
- **Docker Desktop** with Dev Containers extension

### How Resources Are Used

- PostgreSQL: 18GB memory, 4 CPU cores
- Development container: Remaining resources
- 9 persistent volumes for data across rebuilds

---

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- [VS Code](https://code.visualstudio.com/) with
  [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- 4+ CPU cores and 20GB RAM available

### First Time Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/3DHDSoft/devmultiplier-academy.git
   cd devmultiplier-academy
   ```

2. **Open in VS Code**

   ```bash
   code .
   ```

3. **Reopen in Container**
   - VS Code will detect the devcontainer configuration
   - Click "Reopen in Container" when prompted
   - Or: Press `F1` → "Dev Containers: Reopen in Container"

4. **Wait for setup to complete**
   - Docker builds the container (~5 minutes first time)
   - `post-create.sh` runs automatically
   - Services start and health checks pass

5. **Verify everything works**

   ```bash
   # Check database connection
   psql -h postgres -U admin -d academy -c "SELECT version();"

   # Start development server
   bun run dev
   ```

6. **Access services**
   - Next.js App: http://localhost:3000
   - Grafana: http://localhost:3001 (admin/admin)
   - pgAdmin: http://localhost:5051
   - Prometheus: http://localhost:9090

---

## Common Use Cases

### 1. Educational Platform (Primary Use Case)

**Scenario**: DevMultiplier Academy teaches professional web development

**Benefits**:

- Students get working environment in 10 minutes
- Instructors don't debug environment setup
- Everyone sees same results
- Teaches production practices (observability, testing)
- Pre-configured tools reduce cognitive load

**Example Workflow**:

```bash
# Student starts course
git clone <repo>
code .
# Click "Reopen in Container"
# 10 minutes later: bun run dev
# App running with full monitoring stack
```

### 2. Team Development

**Scenario**: 5-10 developers collaborating on codebase

**Benefits**:

- Eliminates "works on my machine"
- New team members productive day 1
- Database schema in sync (migrations in version control)
- Consistent linting, formatting, extensions
- Shared debugging tools (Grafana dashboards)

### 3. Open Source Contributions

**Scenario**: External contributors want to submit PRs

**Benefits**:

- No setup documentation needed
- README can focus on features, not installation
- Contributors can test locally
- Maintainers review with same environment

### 4. Remote Development

**Scenario**: Developer works from multiple machines or uses GitHub Codespaces

**Benefits**:

- Same environment everywhere
- Cloud-based development (Codespaces)
- Data persists in volumes
- Claude Code auth preserved

### 5. Production Debugging

**Scenario**: Need to replicate production issue locally

**Benefits**:

- Same PostgreSQL version as production
- Observability stack mirrors production
- Can trace requests end-to-end
- Test migrations safely

---

## Service Overview

### All Services & Ports

| Service         | Container          | Port(s)    | Purpose                  |
| --------------- | ------------------ | ---------- | ------------------------ |
| Dev Environment | dev-x-academy-web  | -          | Your coding workspace    |
| Next.js App     | (in dev container) | 3000       | Application server       |
| PostgreSQL      | postgres           | 5433→5432  | Database with PostGIS    |
| pgAdmin         | pgadmin            | 5051→80    | Database admin UI        |
| OTEL Collector  | otel-collector     | 4317, 4318 | Telemetry pipeline       |
| Tempo           | tempo              | 3200       | Trace storage            |
| Prometheus      | prometheus         | 9090       | Metrics storage          |
| Grafana         | grafana            | 3001→3000  | Visualization dashboards |

**Total**: 8 services, 14 ports forwarded, all pre-configured

---

## Common Commands

### Development

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Type checking & linting
bun run type-check
bun run lint:fix
bun run format:fix
```

### Testing

```bash
# Unit Tests (Vitest)
bun test
bun run test:watch
bun run test:coverage

# E2E Tests (Playwright)
bun run e2e
bun run e2e:ui
bun run e2e:debug
```

### Database

```bash
# Connect to database
psql -h postgres -U admin -d academy

# Backup database
docker exec postgres pg_dump -U admin academy > backup.sql

# Restore database
docker exec -i postgres psql -U admin academy < backup.sql
```

### Observability

```bash
# Generate test telemetry
bun run telemetry:test

# Check OTEL Collector health
curl http://localhost:13133/health

# View logs
docker logs otel-collector
```

---

## Troubleshooting Quick Reference

### Container Won't Start

```bash
# Check Docker is running
docker ps

# Check disk space
df -h

# View logs
docker logs dev-x-academy-web

# Rebuild container
F1 → "Dev Containers: Rebuild Container"
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs postgres

# Wait for health check
until pg_isready -h postgres -U admin -d academy; do sleep 2; done
```

### No Data in Grafana

```bash
# Check all containers running
docker ps | grep -E "otel-collector|tempo|prometheus|grafana"

# Check OTEL health
curl http://localhost:13133/health

# Generate test data
bun run telemetry:test

# Check Prometheus targets
# Visit http://localhost:9090/targets
```

---

## Bottom Line

This is a **production-grade, enterprise-level development environment** that eliminates weeks of setup time and
provides:

- ⚡ **10-minute onboarding** vs. 4-hour manual setup
- 🎯 **Zero version conflicts** across team members
- 📊 **Production-grade monitoring** ready out of the box
- 🧪 **Complete testing stack** (unit + E2E)
- 🛡️ **Enterprise security practices** built-in

Perfect for an academy/educational platform that needs to onboard developers quickly while teaching professional-grade
development practices with real monitoring and tracing tools.

---

## Additional Documentation

For comprehensive details, see:

- **Full Documentation**: [docs/devcontainer-overview.md](devcontainer-overview.md)
- **Detailed Executive Overview**: [docs/devcontainer-executive-overview.md](devcontainer-executive-overview.md)
- **Observability Guide**: [.devcontainer/observability-setup.md](../.devcontainer/observability-setup.md)
- **Grafana Dashboards**: [.devcontainer/grafana/README.md](../.devcontainer/grafana/README.md)

---

**DevMultiplier Academy** | [DevMultiplier.com](https://DevMultiplier.com)
