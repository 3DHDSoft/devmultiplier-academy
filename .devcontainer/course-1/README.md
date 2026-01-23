# Course 1 - Simplified Development Environment

A lightweight devcontainer optimized for GitHub Codespaces free tier.

## What's Included

| Service | Description | Resource Usage |
|---------|-------------|----------------|
| Node.js 22 | Development container | 1.5 CPU, 3GB RAM |
| PostgreSQL 16 | Database | 0.5 CPU, 512MB RAM |

**Total**: ~2 CPU cores, ~3.5GB RAM (fits 2-core Codespace)

## Quick Start

### Option 1: GitHub Codespaces (Recommended)

1. Click the green **Code** button on GitHub
2. Select **Codespaces** tab
3. Click **Create codespace on main**
4. Select **2-core** machine type
5. Wait for setup (~2-3 minutes)

### Option 2: VS Code + Docker Desktop

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install [VS Code](https://code.visualstudio.com/) + [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open this folder in VS Code
4. Press `F1` → "Dev Containers: Reopen in Container"
5. Select `course-1` when prompted

## Database Access

| Property | Value |
|----------|-------|
| Host | `postgres` (from container) or `localhost` (from host) |
| Port | `5432` |
| User | `postgres` |
| Password | `postgres` |
| Database | `academy` |

**Connection string:**
```
postgresql://postgres:postgres@postgres:5432/academy?schema=public
```

### Using SQLTools (VS Code)

1. Click the database icon in the sidebar
2. Click "Add New Connection"
3. Select "PostgreSQL"
4. Enter the credentials above

## Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Database operations
npx prisma studio      # Open database browser
npx prisma db push     # Push schema changes
npx prisma migrate dev # Create migration
```

## Differences from Full Environment

This simplified setup removes:

- ❌ Observability stack (Grafana, Prometheus, Tempo)
- ❌ OpenTelemetry Collector
- ❌ pgAdmin (use SQLTools instead)
- ❌ PostGIS extensions
- ❌ Custom Zsh/Powerlevel10k shell
- ❌ Playwright browser dependencies

These features are available in the full [.devcontainer/](../) setup for advanced courses.

## Codespaces Usage Tips

### Free Tier Limits

| Account Type | Free Hours (2-core) | Free Storage |
|--------------|---------------------|--------------|
| Free GitHub | 30 hours/month | 15 GB |
| Pro/Student | 45 hours/month | 20 GB |

### Save Your Hours

1. **Stop when not using**: Codespaces → ⋯ → Stop codespace
2. **Set auto-stop**: Settings → Codespaces → Default idle timeout → 30 minutes
3. **Delete old codespaces**: They consume storage even when stopped

## Troubleshooting

### Database connection refused

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker restart course-1-postgres
```

### Out of disk space

```bash
# Clean npm cache
npm cache clean --force

# Clean Docker
docker system prune -f
```

### Slow performance

Consider upgrading to a 4-core Codespace if available, or use local Docker Desktop.
