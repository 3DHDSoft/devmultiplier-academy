# Prisma Introduction

Prisma is a next-generation ORM (Object-Relational Mapping) tool that makes working with databases easier and more
type-safe. This project uses Prisma to manage the PostgreSQL database.

## Project Configuration

This project uses:

- **Database**: PostgreSQL 18 with PostGIS 3.6
- **Prisma Schema**: `prisma/schema.prisma`
- **Prisma Config**: `prisma.config.ts`
- **Generated Client**: `src/generated/prisma`

## Getting Started

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
