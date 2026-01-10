# Database Migration

Safely create and apply database migrations with Prisma.

## Instructions

Guide through safe database migration workflow.

### Step 1: Review Schema Changes

```bash
# View current schema
cat prisma/schema.prisma

# Check for uncommitted changes
git diff prisma/schema.prisma

# Validate schema syntax
bunx prisma validate
```

### Step 2: Assess Migration Risk

| Change Type | Risk Level | Notes |
|-------------|------------|-------|
| Add table | 🟢 Low | Safe, no data impact |
| Add nullable column | 🟢 Low | Safe, existing rows get NULL |
| Add column with default | 🟢 Low | Safe, existing rows get default |
| Add required column | 🔴 High | Fails if table has data |
| Rename column | 🟠 Medium | Data preserved, code must update |
| Drop column | 🔴 High | Data loss, ensure not needed |
| Drop table | 🔴 High | Data loss, ensure not needed |
| Change column type | 🟠 Medium | May fail or lose precision |
| Add index | 🟢 Low | Safe, may be slow on large tables |
| Add unique constraint | 🟠 Medium | Fails if duplicates exist |

### Step 3: Development Migration

```bash
# Create migration (development only)
bunx prisma migrate dev --name <migration_name>

# This will:
# 1. Generate SQL migration file
# 2. Apply to development database
# 3. Regenerate Prisma Client
```

#### Naming Conventions

```bash
# Good migration names
bunx prisma migrate dev --name add_course_status_field
bunx prisma migrate dev --name create_enrollments_table
bunx prisma migrate dev --name add_user_locale_index
bunx prisma migrate dev --name rename_title_to_name

# Bad migration names
bunx prisma migrate dev --name update        # Too vague
bunx prisma migrate dev --name fix           # Not descriptive
bunx prisma migrate dev --name changes       # Meaningless
```

### Step 4: Review Generated Migration

```bash
# View the generated SQL
cat prisma/migrations/<timestamp>_<name>/migration.sql
```

Check for:
- [ ] Expected SQL statements
- [ ] No unintended drops
- [ ] Proper NULL handling
- [ ] Index creation if needed

### Step 5: Test Migration

```bash
# Reset and reapply all migrations (development only!)
bunx prisma migrate reset

# This will:
# 1. Drop database
# 2. Recreate database
# 3. Apply all migrations
# 4. Run seed (if configured)
```

### Step 6: Production Deployment

```bash
# Check migration status
bunx prisma migrate status

# Apply pending migrations (production)
bunx prisma migrate deploy

# This will:
# 1. Apply pending migrations only
# 2. NOT reset or generate new migrations
# 3. Fail if conflicts exist
```

## Common Scenarios

### Adding a New Table

```prisma
// schema.prisma
model NewFeature {
  id        String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```bash
bunx prisma migrate dev --name create_new_feature_table
```

### Adding a Column

```prisma
model users {
  // existing fields...
  phoneNumber String?  // Nullable = safe
}
```

```bash
bunx prisma migrate dev --name add_user_phone_number
```

### Adding Required Column to Existing Table

```prisma
model users {
  // existing fields...
  status String @default("active")  // Default = safe
}
```

```bash
bunx prisma migrate dev --name add_user_status_with_default
```

### Adding an Index

```prisma
model enrollments {
  // fields...

  @@index([userId, status])  // Composite index
}
```

```bash
bunx prisma migrate dev --name add_enrollment_user_status_index
```

### Renaming a Column

⚠️ Prisma doesn't auto-detect renames. Use raw SQL:

```sql
-- migration.sql (manual edit)
ALTER TABLE "users" RENAME COLUMN "old_name" TO "new_name";
```

Or use two-step migration:
1. Add new column
2. Migrate data
3. Remove old column

## Rollback Strategies

### Development Rollback

```bash
# Reset to clean state
bunx prisma migrate reset
```

### Production Rollback

Create a new migration that reverses changes:

```bash
# If you added a column
bunx prisma migrate dev --name revert_add_column
# Then manually edit SQL to DROP COLUMN

# If you dropped something - restore from backup
```

## Pre-Migration Checklist

```markdown
### Before Migration
- [ ] Schema changes reviewed
- [ ] Risk level assessed
- [ ] Backup created (production)
- [ ] Application code updated for changes
- [ ] Tests updated

### After Migration
- [ ] Migration applied successfully
- [ ] Application functioning correctly
- [ ] Data integrity verified
- [ ] Performance acceptable
```

## Emergency Commands

```bash
# Mark migration as applied (without running)
bunx prisma migrate resolve --applied <migration_name>

# Mark migration as rolled back
bunx prisma migrate resolve --rolled-back <migration_name>

# Force reset (DESTRUCTIVE - development only)
bunx prisma migrate reset --force
```

## Usage

```bash
# Interactive migration workflow
/migrate

# Create specific migration
/migrate add user preferences

# Check status
/migrate status

# Deploy to production
/migrate deploy
```
