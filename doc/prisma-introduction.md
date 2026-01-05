# Prisma Introduction

Prisma is a next-generation ORM (Object-Relational Mapping) tool that makes working with databases easier and more
type-safe. This project uses **Prisma 7+** with PostgreSQL 18.

## Database Architecture

```mermaid
graph TD
    App["Next.js App<br/>Server & Client"] -->|Prisma Client| PrismaLib["Prisma ORM<br/>Type-Safe Layer"]
    PrismaLib -->|Generated Code| Schema["prisma/schema.prisma<br/>Data Models"]
    PrismaLib -->|SQL Queries| DB[("PostgreSQL 18<br/>with PostGIS 3.6")]

    Schema -->|Migrations| Migrations["prisma/migrations/<br/>Version History"]
    Migrations -->|Applied to| DB

    Config["prisma.config.ts<br/>Configuration"] -.->|Environment| PrismaLib

    style PrismaLib fill:#194c98,stroke:#1971c2,color:#fff
    style DB fill:#2d5a3d,stroke:#2f9e44,color:#fff
```

## Project Configuration

This project uses:

- **Database**: PostgreSQL 18 with PostGIS 3.6
- **Prisma Version**: 7+ (latest)
- **Prisma Schema**: `prisma/schema.prisma`
- **Prisma Config**: `prisma.config.ts` (Prisma 7+ requirement)
- **Generated Client**: `src/generated/prisma`
- **ID Generation**: PostgreSQL 18 native `uuidv7()` (time-ordered UUIDs)

## Prisma Workflow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Schema as schema.prisma
    participant Migrate as prisma migrate
    participant Gen as prisma generate
    participant DB as PostgreSQL
    participant App as Next.js App

    Dev->>Schema: Edit data models
    Dev->>Migrate: bun exec prisma migrate dev
    Migrate->>Migrate: Create migration file
    Migrate->>DB: Apply SQL migration
    Gen->>Gen: Generate TypeScript types
    Gen->>App: Update Prisma Client
    App->>DB: Query with type safety
```

## Getting Started

### Prisma 7+ Configuration

In Prisma 7+, the database connection is configured in `prisma.config.ts` instead of the schema file:

**`prisma.config.ts`**

```typescript
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
```

**`prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  // URL is now configured in prisma.config.ts
}}
```

Make sure your `.env.local` has the DATABASE_URL:

```bash
DATABASE_URL="postgresql://admin:academy2026@postgres:5432/academy"
```

### CONNECT EXISTING DATABASE

1. Configure your DATABASE_URL in `prisma.config.ts`
2. Run `prisma db pull` to introspect your database.

```bash
bunx prisma db pull
```

### CREATE NEW DATABASE

**Local:**

```bash
bunx prisma dev  # runs Postgres locally in your terminal
```

**Cloud:**

```bash
bunx create-db  # creates a free Prisma Postgres database
```

Then, define your models in `prisma/schema.prisma` and run `prisma migrate dev` to apply your schema.

```bash
bunx prisma migrate dev --name init
```

## Prisma 7 Schema Best Practices

### ID Generation with UUID v7

This project uses PostgreSQL 18's native `uuidv7()` function for time-ordered UUIDs:

```prisma
model User {
  id    String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  email String   @unique
  // ... other fields
}
```

**Benefits of UUID v7:**

- ✅ Time-ordered (better for indexing than UUID v4)
- ✅ Native PostgreSQL 18 support (no extensions needed)
- ✅ Sortable by creation time
- ✅ Better performance in distributed systems

### Prisma Client Generation

In Prisma 7, the client is generated to a custom output directory:

```typescript
// src/generated/prisma/index.ts is auto-generated
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Type-safe queries
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

## Common Commands

### Development Workflow

```bash
# Generate Prisma Client (after schema changes)
bunx prisma generate

# Create a new migration
bunx prisma migrate dev --name descriptive_name

# Apply pending migrations (production)
bunx prisma migrate deploy

# Open Prisma Studio (visual database editor)
bunx prisma studio

# Pull schema from existing database
bunx prisma db pull

# Push schema changes without migrations (prototyping)
bunx prisma db push

# Reset database and apply all migrations
bunx prisma migrate reset
```

### Inspection & Debugging

```bash
# View migration status
bunx prisma migrate status

# Format your schema file
bunx prisma format

# Validate your schema
bunx prisma validate
```

## Database Connection

The database connection is configured in `.env.local`:

```env
DATABASE_URL="postgresql://admin:academy2026@postgres:5432/academy"
```

### Available Database Users

- **admin** (Superuser): `admin:academy2026`
- **test** (Standard user): `test:test`
- **sa** (Superuser): Original database admin

## Schema Structure

The schema is defined in `prisma/schema.prisma`. Currently configured with:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

## Using Prisma Client

After generating the Prisma Client, use it in your application:

```typescript
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Example: Query all users
const users = await prisma.user.findMany();

// Example: Create a new user
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});
```

## Installed PostgreSQL Extensions

The academy database includes these extensions:

- **uuid-ossp**: UUID generation
- **ltree**: Hierarchical data structures
- **pg_trgm**: Full-text search and LIKE optimization
- **btree_gist**: Advanced indexing
- **btree_gin**: GIN indexes
- **postgis**: Spatial/geographic data
- **postgis_topology**: Topology support
- **postgis_raster**: Raster data support
- **citext**: Case-insensitive text
- **hstore**: Key-value store
- **pg_stat_statements**: Query performance monitoring
- **unaccent**: Remove accents from strings
- **tablefunc**: Crosstab and pivot functions

## Best Practices

1. **Always run migrations in development**: Use `prisma migrate dev` to create and apply migrations
2. **Use transactions for related operations**: Ensure data consistency
3. **Use Prisma Studio for quick data inspection**: `bunx prisma studio`
4. **Keep schema.prisma as the source of truth**: Don't manually modify the database
5. **Use descriptive migration names**: Makes it easier to understand the history
6. **Test migrations before deploying**: Use a staging environment

## Troubleshooting

### Connection Issues

If you can't connect to the database:

```bash
# Test database connection
pg_isready -h postgres -U admin -d academy

# Connect via psql
PGPASSWORD=academy2026 psql -h postgres -U admin -d academy
```

### Migration Drift

If your database schema doesn't match your migrations:

```bash
# Check migration status
bunx prisma migrate status

# Reset and reapply (development only)
bunx prisma migrate reset
```

### Schema Changes Not Reflecting

```bash
# Regenerate Prisma Client
bunx prisma generate

# Restart your dev server
bun run dev
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [PostgreSQL Extensions Guide](https://www.postgresql.org/docs/current/contrib.html)

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
