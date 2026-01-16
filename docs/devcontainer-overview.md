# DevContainer Overview - Dev-X-Academy-Web

## Executive Summary

This devcontainer transforms the **DevMultiplier Academy website** from a complex multi-service application requiring hours of manual setup into a **one-click development environment**. It's specifically engineered for teaching and developing a production-grade Next.js educational platform with enterprise-level observability.

## Table of Contents

- [Core Purpose](#core-purpose)
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Service Details](#service-details)
- [Development Tools](#development-tools)
- [Automated Setup](#automated-setup)
- [Port Configuration](#port-configuration)
- [Environment Variables](#environment-variables)
- [Data Persistence](#data-persistence)
- [Security Features](#security-features)
- [Use Cases](#use-cases)
- [Troubleshooting](#troubleshooting)

## Core Purpose

### Problem It Solves

Setting up this project traditionally requires:

- Installing Node.js 22 and Bun 1.3.5+
- Setting up PostgreSQL 18 with PostGIS extensions
- Configuring an entire observability stack (OpenTelemetry, Prometheus, Tempo, Grafana)
- Installing 50+ VS Code extensions
- Troubleshooting version conflicts across different operating systems
- **Total time: 2-4 hours** (often more with issues)

### Solution

1. Open project in VS Code
2. Click "Reopen in Container"
3. Wait 5-10 minutes
4. Start coding with everything configured

**Time saved: ~3.5 hours per developer**

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- [VS Code](https://code.visualstudio.com/) with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
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

## Architecture Overview

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Development Container (Ubuntu 24.04 + Node 22)          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Workspace: /workspaces/dev-x-academy-web         │  │
│  │  User: node (non-root with sudo)                  │  │
│  │  Shell: Zsh with Oh My Zsh                        │  │
│  │  Runtime: Node.js 22.x + Bun 1.3.5+               │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ Docker Network: dev-web-net
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐              ┌───────▼──────────────────┐
│  Database      │              │  Observability Stack     │
│                │              │                          │
│  PostgreSQL 18 │              │  Next.js App (:3000)     │
│  + PostGIS 3.6 │              │         ↓ OTLP          │
│  Port: 5433    │              │  OTEL Collector (:4318) │
│  User: admin   │              │         ↓               │
│  DB: academy   │              │    ┌────┴────┐          │
│                │              │    │         │          │
│  pgAdmin 4     │              │  Tempo  Prometheus      │
│  Port: 5051    │              │ (traces) (metrics)      │
│                │              │    │         │          │
└────────────────┘              │    └────┬────┘          │
                                │         ↓               │
                                │    Grafana (:3001)      │
                                │    - App Overview       │
                                │    - Performance        │
                                │    - Security           │
                                └─────────────────────────┘
```

### Data Flow

```
Developer writes code in VS Code
    ↓
Code runs in dev-x-academy-web container
    ↓
Next.js app starts on port 3000
    ↓
App sends telemetry → OTEL Collector (port 4318)
    ↓
    ├─→ Tempo (stores distributed traces)
    └─→ Prometheus (stores metrics via scraping)
         ↓
    Grafana queries both for visualization
```

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

### 2. Enterprise Observability

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

### 3. VS Code Extensions (50+)

Pre-installed and configured automatically:

#### AI & Productivity

- `anthropic.claude-code` - Claude Code assistant
- `GitHub.copilot` - AI pair programming
- `GitHub.copilot-chat` - Chat interface
- `alefragnani.project-manager` - Project switching

#### Git Tools

- `eamodio.gitlens` - Advanced Git visualization
- `mhutchie.git-graph` - Commit graph
- `donjayamanne.githistory` - File history
- `github.vscode-pull-request-github` - PR management
- `github.vscode-github-actions` - CI/CD workflows

#### Language Support

- `ms-vscode.vscode-typescript-next` - Latest TypeScript features
- `dbaeumer.vscode-eslint` - Linting
- `esbenp.prettier-vscode` - Code formatting
- `prisma.prisma` - ORM support
- `kumar-harsh.graphql-for-vscode` - GraphQL schemas

#### Testing & Quality

- `ms-playwright.playwright` - E2E testing
- `vitest.explorer` - Unit test runner
- `streetsidesoftware.code-spell-checker` - Spell checking
- `kisstkondoros.vscode-codemetrics` - Complexity analysis

#### Database

- `doublefint.pgsql` - PostgreSQL support
- `bradymholt.pgformatter` - SQL formatting
- `mtxr.sqltools` - Query runner
- `mtxr.sqltools-driver-pg` - PostgreSQL driver

#### Markdown (7 extensions)

- `bierner.markdown-mermaid` - Diagram support
- `goessner.mdmath` - Math equations
- `yzhang.markdown-all-in-one` - Shortcuts & TOC
- `davidanson.vscode-markdownlint` - Linting
- `shd101wyy.markdown-preview-enhanced` - Enhanced preview
- `yzane.markdown-pdf` - PDF export
- `bierner.markdown-github-preview` - GitHub styling

#### Docker & DevOps

- `ms-azuretools.vscode-docker` - Container management
- `docker.docker` - Dockerfile support

### 4. Professional CLI Tools

Installed via devcontainer features:

| Tool          | Purpose              | Usage                                                    |
| ------------- | -------------------- | -------------------------------------------------------- |
| `git`         | Version control      | Standard Git operations                                  |
| `git-lfs`     | Large file storage   | Track binary files                                       |
| `gh`          | GitHub CLI           | `gh pr create`, `gh issue list`                          |
| `vercel`      | Deployment           | `vercel deploy`                                          |
| `stripe`      | Payment testing      | `stripe listen --forward-to localhost:3000/api/webhooks` |
| `tailwindcss` | CSS standalone       | `tailwindcss -i input.css -o output.css`                 |
| `jq`          | JSON processor       | `cat data.json \| jq '.users[0]'`                        |
| `tmux`        | Terminal multiplexer | Multiple terminal sessions                               |
| `ffmpeg`      | Media processing     | Video/audio conversion                                   |
| `nvtop`       | GPU monitoring       | Track GPU usage                                          |

### 5. Development Environment

**Shell**: Zsh with Oh My Zsh

- Syntax highlighting
- Auto-suggestions
- Git status in prompt
- Custom themes and plugins

**Package Manager**: Bun

- 3x faster than npm/yarn
- Drop-in replacement
- Native TypeScript support

**Database Client**: psql

- Direct PostgreSQL access
- Pre-configured connection

## Service Details

### Development Container ([dev-x-academy-web](.devcontainer/docker-compose.yml#L20))

```yaml
Base Image: Ubuntu 24.04
Node.js: 22.x
User: node (non-root)
Working Directory: /workspaces/dev-x-academy-web
```

**Installed Dependencies**:

- PostgreSQL client (`psql`)
- Playwright browser dependencies
- X11 display utilities (for headless testing)
- Build tools and compilers

### PostgreSQL 18 ([postgres](.devcontainer/docker-compose.yml#L46))

```yaml
Image: postgis/postgis:18-3.6-alpine
Container: postgres
Port: 5433 → 5432
Credentials:
  - Admin: admin / academy2026
  - App User: academy_user / academy_password
Database: academy
```

**Features**:

- PostGIS 3.6 spatial extensions
- All contrib modules enabled
- Custom configuration via [postgresql.conf](.devcontainer/config/postgres/postgresql.conf)
- Initialization script: [init-user-db.sh](.devcontainer/config/postgres/init-user-db.sh)
- Health checks with 30s grace period
- 2.81GB shared memory for parallel queries

**Resource Limits**:

- Memory: 18GB limit, 11GB reserved
- CPU: 4 cores limit, 2 cores reserved

**Volumes**:

- `postgres_web_data`: Database files
- `postgres_web_backups`: Backup location

### pgAdmin 4 ([pgadmin](.devcontainer/docker-compose.yml#L93))

```yaml
Image: dpage/pgadmin4:9.11
Container: pgadmin
Port: 5051 → 80
Credentials: admin@admin.com / YourVeryStr0ngPassword
```

Web-based database administration tool with:

- Visual query builder
- Schema designer
- Import/export tools
- Query history

### OpenTelemetry Collector ([otel-collector](.devcontainer/docker-compose.yml#L107))

```yaml
Image: otel/opentelemetry-collector-contrib:latest
Container: otel-collector
Ports:
  - 4317: OTLP gRPC receiver
  - 4318: OTLP HTTP receiver
  - 8888: Collector metrics
  - 13133: Health check
```

**Configuration**: [otel-collector-config.yml](.devcontainer/otel-collector/otel-collector-config.yml)

Routes telemetry from Next.js to:

- Tempo (traces via OTLP)
- Prometheus (metrics via exporter)

### Grafana Tempo ([tempo](.devcontainer/docker-compose.yml#L125))

```yaml
Image: grafana/tempo:latest
Container: tempo
Ports:
  - 3200: Query API
  - 4319: OTLP gRPC (direct)
```

**Configuration**: [tempo.yml](.devcontainer/tempo/tempo.yml)

Stores distributed traces for:

- Request tracing across services
- Performance bottleneck identification
- Error root cause analysis

### Prometheus ([prometheus](.devcontainer/docker-compose.yml#L144))

```yaml
Image: prom/prometheus:latest
Container: prometheus
Port: 9090
```

**Configuration**: [prometheus.yml](.devcontainer/prometheus/prometheus.yml)

Scrapes metrics from:

- OTEL Collector (every 15s)
- Next.js app metrics endpoint

### Grafana ([grafana](.devcontainer/docker-compose.yml#L166))

```yaml
Image: grafana/grafana:latest
Container: grafana
Port: 3001 → 3000
Credentials: admin / admin
```

**Provisioned Resources**:

- Datasources: [Prometheus](.devcontainer/grafana/provisioning/datasources/prometheus.yml), [Tempo](.devcontainer/grafana/provisioning/datasources/tempo.yml)
- Dashboard Config: [dashboards.yml](.devcontainer/grafana/provisioning/dashboards/dashboards.yml)
- Pre-built Dashboards:
  - [Application Overview](.devcontainer/grafana/dashboards/application-overview.json)
  - [Performance Metrics](.devcontainer/grafana/dashboards/performance-metrics.json)
  - [Security Monitoring](.devcontainer/grafana/dashboards/security-monitoring.json)

## Development Tools

### Automated Setup

#### Post-Create Script ([post-create.sh](.devcontainer/post-create.sh))

Runs **once** after container is created:

1. **Claude Code Setup**

   ```bash
   mkdir -p /home/node/.claude
   chmod 700 /home/node/.claude
   ```

2. **Global Packages**

   ```bash
   bun add -g npm-check-updates
   ```

3. **Project Dependencies**

   ```bash
   bun install
   ```

4. **Wait for Services**

   ```bash
   until pg_isready -h postgres -U admin -d academy; do
     sleep 2
   done
   ```

5. **Fix Permissions**

   ```bash
   chmod 644 .devcontainer/prometheus/prometheus.yml
   # ... other config files
   ```

6. **Display Welcome Message**
   - Database credentials
   - Useful commands
   - Service URLs

#### Post-Start Script ([post-start.sh](.devcontainer/post-start.sh))

Runs **every time** container starts:

1. Verify PostgreSQL connection
2. Display service status
3. Confirm environment ready

### Common Commands

```bash
# Development
bun run dev              # Start Next.js dev server
bun run build            # Production build
bun run start            # Start production server

# Type Checking & Linting
bun run type-check       # TypeScript validation
bun run lint             # ESLint checks
bun run lint:fix         # Auto-fix linting issues
bun run format           # Check Prettier formatting
bun run format:fix       # Auto-format code

# Testing
bun test                 # Run unit tests (Vitest)
bun run test:watch       # Watch mode
bun run test:coverage    # Coverage report
bun run test:ui          # Visual test UI

bun run e2e              # Run E2E tests (Playwright)
bun run e2e:ui           # Playwright UI mode
bun run e2e:debug        # Debug mode
bun run e2e:headed       # See browser

# Database
psql -h postgres -U admin -d academy    # Connect to database
docker exec -it postgres bash           # Shell into container

# Telemetry Testing
bun run telemetry:test      # Generate test telemetry
bun run telemetry:traffic   # Continuous traffic simulation
bun run telemetry:login     # Test login metrics

# Docker Management
docker-compose up -d        # Start all services
docker-compose down         # Stop all services
docker-compose down -v      # Stop and remove volumes
docker ps                   # List running containers
docker logs otel-collector  # View collector logs
```

## Port Configuration

### Port Forwarding Table

| Port  | Service    | Label                  | Auto-Forward | Purpose                |
| ----- | ---------- | ---------------------- | ------------ | ---------------------- |
| 3000  | Next.js    | Next.js App            | notify       | Application server     |
| 3001  | Grafana    | Grafana                | notify       | Dashboards             |
| 3200  | Tempo      | Tempo                  | silent       | Trace queries          |
| 4317  | OTEL       | OTLP gRPC              | silent       | Telemetry ingestion    |
| 4318  | OTEL       | OTLP HTTP              | silent       | Telemetry ingestion    |
| 4319  | Tempo      | Tempo OTLP             | silent       | Direct trace ingestion |
| 5051  | pgAdmin    | pgAdmin                | silent       | Database admin         |
| 5433  | PostgreSQL | PostgreSQL 18          | silent       | Database connection    |
| 8888  | OTEL       | OTel Collector Metrics | silent       | Collector self-metrics |
| 8889  | OTEL       | OTel Prometheus Export | silent       | Metrics scraping       |
| 9090  | Prometheus | Prometheus             | silent       | Metrics queries        |
| 13133 | OTEL       | OTel Health            | silent       | Health checks          |

### Port Access Examples

```bash
# Application
curl http://localhost:3000

# Database
psql -h localhost -p 5433 -U admin -d academy

# Observability
curl http://localhost:13133/health          # OTEL health
curl http://localhost:9090/api/v1/query?query=up  # Prometheus
curl http://localhost:3200/api/search       # Tempo search
```

## Environment Variables

### Container Environment ([devcontainer.json](.devcontainer/devcontainer.json#L216))

```bash
DATABASE_URL=postgresql://admin:academy2026@postgres:5432/academy
POSTGRES_DB=academy
POSTGRES_USER=admin
POSTGRES_PASSWORD=academy2026
NODE_ENV=development
```

### Application Environment (.env or .env.local)

```bash
# Database (Prisma)
DATABASE_URL="postgresql://admin:academy2026@postgres:5432/academy"

# Authentication (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OpenTelemetry (Local)
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318

# OpenTelemetry (Grafana Cloud - Optional)
# OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-3.grafana.net/otlp
# OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Basic <token>"}
```

### Docker Compose Environment ([.devcontainer/.env](.devcontainer/.env))

```bash
# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=academy2026
POSTGRES_DB=academy
POSTGRES_PORT=5433

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=YourVeryStr0ngPassword
PGADMIN_PORT=5051

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
GRAFANA_PORT=3001

# Prometheus
PROMETHEUS_PORT=9090

# Tempo
TEMPO_PORT=3200

# OTEL Collector
OTEL_COLLECTOR_GRPC_PORT=4317
OTEL_COLLECTOR_HTTP_PORT=4318
```

## Data Persistence

### Docker Volumes

All data persists across container rebuilds:

| Volume                 | Purpose          | Contents                    |
| ---------------------- | ---------------- | --------------------------- |
| `claude_auth_data`     | Claude Code auth | API tokens, session data    |
| `postgres_web_data`    | PostgreSQL data  | Database files, WAL logs    |
| `postgres_web_backups` | Database backups | pg_dump outputs             |
| `pgadmin_web_data`     | pgAdmin settings | Saved queries, connections  |
| `prometheus_web_data`  | Metrics storage  | Time-series data            |
| `grafana_web_data`     | Grafana data     | Dashboards, users, settings |
| `tempo_web_data`       | Trace storage    | Distributed traces          |
| `node_modules`         | Dependencies     | bun packages                |
| `bun_cache`            | Package cache    | Downloaded packages         |

### Backup & Restore

**Backup Database**:

```bash
docker exec postgres pg_dump -U admin academy > backup.sql
# Or inside container:
pg_dump -U admin academy > /var/lib/postgresql/backups/backup-$(date +%Y%m%d).sql
```

**Restore Database**:

```bash
docker exec -i postgres psql -U admin academy < backup.sql
```

**Export Volume**:

```bash
docker run --rm -v postgres_web_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-data.tar.gz -C /data .
```

**Import Volume**:

```bash
docker run --rm -v postgres_web_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres-data.tar.gz -C /data
```

## Security Features

### Container Security

1. **Non-Root User**
   - Runs as `node` user (UID 1000)
   - Sudo access with NOPASSWD for dev convenience
   - Home directory: `/home/node`

2. **Security Options**

   ```yaml
   security_opt:
     - no-new-privileges:true
   ```

   Prevents privilege escalation attacks

3. **Read-Only Mounts**

   ```yaml
   volumes:
     - ./config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
   ```

   Configuration files mounted read-only

4. **Network Isolation**
   - Private Docker network: `dev-web-net`
   - Services not exposed to host except forwarded ports
   - Inter-service communication via container names

### Database Security

1. **Authentication**
   - SCRAM-SHA-256 password hashing (PostgreSQL 18 default)
   - Separate admin and application users

2. **Connection Security**
   - PostgreSQL only accessible via Docker network
   - pgAdmin requires authentication

3. **User Separation**
   ```sql
   -- Admin user: admin (full privileges)
   -- App user: academy_user (limited privileges)
   -- Test user: test (dev/test only)
   ```

### Secrets Management

**DO NOT commit**:

- `.env.local` (application secrets)
- `.devcontainer/.env` (infrastructure secrets)

**Use environment variables**:

```bash
# Good
DATABASE_URL=$DATABASE_URL bun run migrate

# Bad (hardcoded)
DATABASE_URL=postgresql://admin:password@localhost:5432/db bun run migrate
```

## Use Cases

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

**Example Workflow**:

```bash
# New developer joins
git clone <repo>
code .
# Container builds (one-time)
bun run dev
# Immediately productive
```

### 3. Open Source Contributions

**Scenario**: External contributors want to submit PRs

**Benefits**:

- No setup documentation needed
- README can focus on features, not installation
- Contributors can test locally
- Maintainers review with same environment

**Example Workflow**:

```bash
# Contributor forks repo
git clone <fork>
code .
# Container starts
# Make changes, test, submit PR
```

### 4. Remote Development

**Scenario**: Developer works from multiple machines or uses GitHub Codespaces

**Benefits**:

- Same environment everywhere
- Cloud-based development (Codespaces)
- Data persists in volumes
- Claude Code auth preserved

**Example Workflow**:

```bash
# On laptop
git push

# On desktop
git pull
# Container already configured, volumes intact

# In Codespaces
# Click "Open in Codespace"
# Same devcontainer, cloud-hosted
```

### 5. Production Debugging

**Scenario**: Need to replicate production issue locally

**Benefits**:

- Same PostgreSQL version as production
- Observability stack mirrors production
- Can trace requests end-to-end
- Test migrations safely

**Example Workflow**:

```bash
# Export production database
pg_dump -h prod.example.com > prod-backup.sql

# Import to local
docker exec -i postgres psql -U admin academy < prod-backup.sql

# Debug with Grafana
bun run dev
# Visit http://localhost:3001
# Trace slow queries, debug issues
```

## Troubleshooting

### Container Won't Start

**Symptom**: "Failed to start container"

**Solutions**:

```bash
# Check Docker is running
docker ps

# Check disk space
df -h

# Check Docker logs
docker logs dev-x-academy-web

# Rebuild container
F1 → "Dev Containers: Rebuild Container"
```

### Database Connection Failed

**Symptom**: `psql: could not connect to server`

**Solutions**:

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check health status
docker inspect postgres | jq '.[0].State.Health'

# View PostgreSQL logs
docker logs postgres

# Wait for health check
until pg_isready -h postgres -U admin -d academy; do sleep 2; done

# Test connection manually
docker exec -it postgres psql -U admin -d academy -c "SELECT version();"
```

### Port Already in Use

**Symptom**: "Port 3000 is already allocated"

**Solutions**:

```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>

# Change port in docker-compose.yml
ports: ['3001:3000']  # Use 3001 instead
```

### No Data in Grafana

**Symptom**: Empty dashboards, no metrics/traces

**Solutions**:

1. **Check all containers running**:

   ```bash
   docker ps | grep -E "otel-collector|tempo|prometheus|grafana"
   ```

2. **Verify OTEL Collector health**:

   ```bash
   curl http://localhost:13133/health
   # Should return: {"status":"OK"}
   ```

3. **Check OTEL Collector logs**:

   ```bash
   docker logs otel-collector
   # Look for errors
   ```

4. **Verify Next.js instrumentation**:

   ```bash
   bun run dev
   # Look for: "✅ OpenTelemetry instrumentation initialized"
   ```

5. **Test telemetry manually**:

   ```bash
   bun run telemetry:test
   # Generates test traces and metrics
   ```

6. **Check Prometheus targets**:
   - Visit http://localhost:9090/targets
   - OTEL Collector should show as "UP"

7. **Verify datasources in Grafana**:
   - Visit http://localhost:3001/datasources
   - Prometheus and Tempo should be configured
   - Click "Test" on each

### Slow Container Performance

**Symptom**: Container sluggish, high CPU/memory

**Solutions**:

1. **Check Docker resources**:
   - Docker Desktop → Settings → Resources
   - Allocate more CPU/memory if available

2. **Check volume performance**:

   ```bash
   # macOS: Ensure volumes use cached mode
   volumes:
     - ../..:/workspaces:cached
   ```

3. **Exclude files from sync**:

   ```bash
   # Add to .gitignore
   node_modules/
   .next/
   .vitest-cache/
   ```

4. **Rebuild without cache**:
   ```bash
   docker-compose build --no-cache
   ```

### Permission Denied Errors

**Symptom**: "Permission denied" when accessing files

**Solutions**:

```bash
# Check file ownership
ls -la

# Fix workspace permissions (inside container)
sudo chown -R node:node /workspaces/dev-x-academy-web

# Fix volume permissions
sudo chown -R node:node /home/node/.claude
sudo chmod 700 /home/node/.claude
```

### Extension Not Working

**Symptom**: VS Code extension not functioning

**Solutions**:

```bash
# Reinstall extension in container
F1 → "Dev Containers: Rebuild Container"

# Check extension logs
F1 → "Developer: Show Logs" → Select extension

# Manually install
F1 → "Extensions: Install from VSIX..."
```

### Observability Stack Restart

**Symptom**: Need to restart monitoring services

**Solutions**:

```bash
# Restart individual service
docker restart otel-collector
docker restart tempo
docker restart prometheus
docker restart grafana

# Restart all observability services
cd .devcontainer
docker-compose restart otel-collector tempo prometheus grafana

# Or use convenience script
bash .devcontainer/restart-observability.sh
```

## Advanced Topics

### Switching to Grafana Cloud

Edit `.env.local`:

```bash
# Comment out local config
# OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318

# Enable cloud config
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-3.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Basic <your-token>"}
```

Restart Next.js app:

```bash
# Stop dev server (Ctrl+C)
bun run dev
```

See [observability-setup.md](.devcontainer/observability-setup.md) for details.

### Custom PostgreSQL Configuration

Edit [.devcontainer/config/postgres/postgresql.conf](.devcontainer/config/postgres/postgresql.conf):

```conf
# Example: Increase connections
max_connections = 200

# Enable query logging
log_statement = 'all'
```

Restart PostgreSQL:

```bash
docker restart postgres
```

### Adding VS Code Extensions

Edit [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json#L135):

```json
"extensions": [
  "existing.extension",
  "new.extension-id"
]
```

Rebuild container:

```bash
F1 → "Dev Containers: Rebuild Container"
```

### Custom Startup Commands

Edit [.devcontainer/post-start.sh](.devcontainer/post-start.sh):

```bash
#!/bin/bash
echo "Running custom startup..."

# Your commands here
bun run db:seed
```

Make executable:

```bash
chmod +x .devcontainer/post-start.sh
```

## Resource Requirements

### Minimum

- **CPU**: 4 cores
- **Memory**: 20GB
- **Disk**: 15GB free
- **Network**: Stable connection for initial pull

### Recommended

- **CPU**: 8 cores
- **Memory**: 32GB
- **Disk**: 50GB free (for multiple projects)
- **SSD**: For better volume performance

### Docker Desktop Settings

**macOS/Windows**:

```
Settings → Resources:
  CPUs: 6-8
  Memory: 24-32GB
  Swap: 4GB
  Disk: 100GB
```

**Linux**: Native Docker has full system access, no limits needed.

## Performance Tips

1. **Use cached volumes**:

   ```yaml
   volumes:
     - ../..:/workspaces:cached
   ```

2. **Exclude unnecessary files**:

   ```gitignore
   node_modules/
   .next/
   dist/
   ```

3. **Use Bun instead of npm**:

   ```bash
   bun install  # 3x faster
   ```

4. **Enable BuildKit**:

   ```bash
   export DOCKER_BUILDKIT=1
   ```

5. **Prune unused data**:
   ```bash
   docker system prune -a --volumes
   ```

## Related Documentation

- [Observability Setup Guide](.devcontainer/observability-setup.md)
- [Grafana Dashboards](.devcontainer/grafana/README.md)
- [Docker Compose Reference](.devcontainer/docker-compose.yml)
- [DevContainer Specification](https://containers.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL 18 Release Notes](https://www.postgresql.org/docs/18/release-18.html)

## Support

### Getting Help

1. **Check this document** for common issues
2. **View container logs**:
   ```bash
   docker logs dev-x-academy-web
   docker logs postgres
   ```
3. **Check service status**:
   ```bash
   docker ps -a
   ```
4. **Community**:
   - Project issues: [GitHub Issues](https://github.com/3DHDSoft/devmultiplier-academy/issues)
   - DevContainers: [containers.dev](https://containers.dev/)

### Useful Commands Summary

```bash
# Container Management
docker ps                        # List running containers
docker logs <container>          # View logs
docker exec -it <container> bash # Shell into container
docker restart <container>       # Restart service

# Database
psql -h postgres -U admin -d academy           # Connect
pg_dump -U admin academy > backup.sql          # Backup
psql -U admin academy < backup.sql             # Restore

# Development
bun run dev                      # Start app
bun test                         # Run tests
bun run lint:fix                 # Fix linting

# Observability
curl http://localhost:13133/health             # OTEL health
docker logs otel-collector                     # View logs
bun run telemetry:test                         # Generate test data
```

## Changelog

### Version 1.0 (Current)

- PostgreSQL 18 with PostGIS 3.6
- Complete observability stack (OTEL, Tempo, Prometheus, Grafana)
- 50+ VS Code extensions
- Automated setup scripts
- Node.js 22 + Bun 1.3.5+
- Next.js 16 + React 19
- Prisma 7 ORM

## License

This devcontainer configuration is part of the DevMultiplier Academy project. See main project LICENSE for details.

---

**DevMultiplier Academy** | [DevMultiplier.com](https://DevMultiplier.com)
