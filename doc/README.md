# 3D HD Soft - Development Environment

> **Course Series:** How to become a 10x - 100x developer in the age of AI  
> **Website:** [www.3DHDSoft.com](https://www.3DHDSoft.com)

## Quick Start

### Prerequisites

- **VS Code** with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git**

### Getting Started

1. Clone the repository
2. Open in VS Code
3. When prompted, click **"Reopen in Container"**  
   _(or run Command Palette → "Dev Containers: Reopen in Container")_
4. Wait for the container to build (~2-3 minutes first time)

That's it! Your environment is ready with:
- ✅ Bun & Node.js 22
- ✅ SQL Server 2022 with sample DDD schemas
- ✅ PostgreSQL 16 with sample DDD schemas
- ✅ All VS Code extensions pre-installed

---

## Environment Overview

### Runtimes & Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Bun | Latest | Primary runtime, package manager, test runner |
| Node.js | 22 LTS | Compatibility when needed |
| fnm | Latest | Node version management |
| Git | Latest | Version control |
| GitHub CLI | Latest | GitHub integration |

### Databases

| Database | Port | Credentials | Connection String |
|----------|------|-------------|-------------------|
| **SQL Server 2022** | 1433 | `sa` / `YourStrong@Passw0rd` | `Server=mssql;Database=CourseDB;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=true` |
| **PostgreSQL 16** | 5432 | `devuser` / `devpassword` | `postgresql://devuser:devpassword@postgres:5432/devdb` |

### VS Code Extensions (Pre-installed)

**Database:**
- ms-mssql.mssql (SQL Server)
- mtxr.sqltools (Multi-DB support)
- mtxr.sqltools-driver-pg (PostgreSQL)
- mtxr.sqltools-driver-mssql (SQL Server)

**Development:**
- dbaeumer.vscode-eslint
- esbenp.prettier-vscode
- bradlc.vscode-tailwindcss
- prisma.prisma
- humao.rest-client

**Productivity:**
- github.copilot
- github.copilot-chat
- eamodio.gitlens

---

## Sample Database Schema

Both databases include identical DDD-inspired schemas demonstrating:

### Bounded Contexts (as schemas)

```
├── Orders/
│   ├── Orders          (Aggregate Root)
│   ├── OrderItems      (Child Entity)
│   └── DomainEvents    (Event Store)
├── Inventory/
│   ├── Products        (Aggregate Root)
│   └── StockMovements  (Child Entity)
└── Customers/
    ├── Customers       (Aggregate Root)
    └── Addresses       (Value Object as table)
```

### Key DDD Patterns Demonstrated

1. **Aggregate Roots** - `Orders`, `Products`, `Customers`
2. **Child Entities** - Cascade delete, cannot exist without parent
3. **Value Objects** - `Addresses` stored as separate table but owned by Customer
4. **Domain Events** - JSON event storage for CQRS patterns
5. **Optimistic Concurrency** - Version columns for conflict detection

---

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
# SQL Server
sqlcmd -S mssql -U sa -P 'YourStrong@Passw0rd' -C -d CourseDB

# PostgreSQL
psql -h postgres -U devuser -d devdb
```

### Useful SQL Queries

**SQL Server - List all tables:**
```sql
SELECT SCHEMA_NAME(schema_id) AS [Schema], name AS [Table]
FROM sys.tables
ORDER BY [Schema], [Table];
```

**PostgreSQL - List all tables:**
```sql
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname IN ('orders', 'inventory', 'customers');
```

---

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

---

## Troubleshooting

### Container won't start

```bash
# Check Docker status
docker ps -a

# View container logs
docker logs mssql-dev
docker logs postgres-dev

# Rebuild from scratch
# In VS Code: Command Palette → "Dev Containers: Rebuild Container"
```

### Database connection issues

```bash
# Test SQL Server
sqlcmd -S mssql -U sa -P 'YourStrong@Passw0rd' -C -Q "SELECT @@VERSION"

# Test PostgreSQL
pg_isready -h postgres -U devuser -d devdb
```

### Port conflicts

If ports 1433, 5432, or 3000 are already in use:

1. Stop conflicting services
2. Or modify ports in `.devcontainer/docker-compose.yml`

---

## Optional: pgAdmin

To enable the pgAdmin web interface:

```bash
# Start with the tools profile
docker compose --profile tools up -d pgadmin
```

Access at http://localhost:5050  
Login: `admin@3dhdsoft.com` / `admin`

---

## Support

- **Course Website:** [www.3DHDSoft.com](https://www.3DHDSoft.com)
- **Issues:** Create an issue in the course repository
