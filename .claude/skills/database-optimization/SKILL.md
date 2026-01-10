# Database Optimization Skill

Analyze and optimize database queries, schema design, and performance for PostgreSQL with Prisma ORM.

## Description

This skill provides database performance analysis and optimization recommendations for the DevMultiplier Academy platform. It identifies slow queries, suggests indexes, optimizes Prisma queries, and improves overall database performance.

## Triggers

Activate this skill when:
- User mentions "slow queries" or "database performance"
- User asks to "optimize" database or queries
- User reports timeout or latency issues
- User asks about indexing strategy
- User wants to analyze query performance

## Instructions

### Step 1: Identify Performance Issues

First, gather information about the problem:

```bash
# Check current schema
cat prisma/schema.prisma

# Find Prisma queries in codebase
grep -r "prisma\." src --include="*.ts" -A 3 | head -100

# Look for potential N+1 patterns
grep -r "findMany\|findUnique" src --include="*.ts" -B 2 -A 5
```

### Step 2: Analyze Query Patterns

Look for these common issues:

#### N+1 Query Problem
```typescript
// ❌ N+1 - Executes 1 + N queries
const users = await prisma.users.findMany();
for (const user of users) {
  const enrollments = await prisma.enrollments.findMany({
    where: { userId: user.id }
  });
}

// ✅ Single query with include
const users = await prisma.users.findMany({
  include: {
    enrollments: true
  }
});
```

#### Missing Pagination
```typescript
// ❌ Loads all records
const courses = await prisma.course.findMany();

// ✅ Paginated query
const courses = await prisma.course.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

#### Over-fetching Data
```typescript
// ❌ Fetches all columns
const user = await prisma.users.findUnique({
  where: { id: userId }
});

// ✅ Select only needed fields
const user = await prisma.users.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true
  }
});
```

### Step 3: Index Analysis

Review existing indexes in schema:

```prisma
// Current indexes in schema.prisma
@@index([userId])           // Foreign key index
@@index([courseId])         // Foreign key index
@@index([email])            // Lookup index
@@index([locale])           // Filter index
@@index([createdAt])        // Sort/range index
@@unique([userId, courseId]) // Composite unique (also an index)
```

#### Recommend New Indexes For:
1. **Foreign keys** - All `*Id` fields should be indexed
2. **WHERE clauses** - Fields frequently filtered
3. **ORDER BY** - Fields used for sorting
4. **Composite queries** - Multi-column indexes for common patterns

```prisma
// Example: Add index for common query pattern
model enrollments {
  // ... fields ...

  @@index([userId, status])  // For: WHERE userId = ? AND status = ?
  @@index([courseId, enrolledAt]) // For: WHERE courseId = ? ORDER BY enrolledAt
}
```

### Step 4: Query Optimization Techniques

#### Use Prisma's Count for Totals
```typescript
// ✅ Efficient count
const [courses, total] = await Promise.all([
  prisma.course.findMany({
    skip: (page - 1) * limit,
    take: limit,
  }),
  prisma.course.count()
]);
```

#### Use _count for Related Counts
```typescript
// ✅ Count in single query
const courses = await prisma.course.findMany({
  select: {
    id: true,
    slug: true,
    _count: {
      select: { enrollments: true }
    }
  }
});
// Access: course._count.enrollments
```

#### Batch Operations
```typescript
// ❌ Multiple queries
for (const id of courseIds) {
  await prisma.course.update({
    where: { id },
    data: { status: 'published' }
  });
}

// ✅ Single batch query
await prisma.course.updateMany({
  where: { id: { in: courseIds } },
  data: { status: 'published' }
});
```

#### Transaction for Related Operations
```typescript
// ✅ Atomic transaction
await prisma.$transaction([
  prisma.enrollments.create({
    data: { userId, courseId, status: 'active' }
  }),
  prisma.course_progress.create({
    data: { userId, courseId, modulesComplete: 0 }
  })
]);
```

### Step 5: PostgreSQL-Specific Optimizations

#### Analyze Query Plans
```sql
-- Run in psql or Prisma Studio
EXPLAIN ANALYZE
SELECT * FROM users
WHERE email = 'test@example.com';
```

#### Check Table Statistics
```sql
-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Index usage
SELECT schemaname, relname, indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Unused indexes (candidates for removal)
SELECT schemaname, relname, indexrelname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

#### Connection Pooling
```typescript
// For serverless (Vercel, etc.), use connection pooling
// In prisma/schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // For PgBouncer or similar:
  // directUrl = env("DIRECT_URL")
}
```

### Step 6: Caching Strategies

#### Application-Level Caching
```typescript
// Cache frequently accessed, rarely changed data
import { unstable_cache } from 'next/cache';

const getCourses = unstable_cache(
  async () => {
    return prisma.course.findMany({
      where: { status: 'published' },
      include: { course_translations: true }
    });
  },
  ['published-courses'],
  { revalidate: 3600 } // 1 hour
);
```

#### Query Result Caching Pattern
```typescript
// For user-specific data with short TTL
const getEnrollments = unstable_cache(
  async (userId: string) => {
    return prisma.enrollments.findMany({
      where: { userId },
      include: { Course: true }
    });
  },
  ['user-enrollments'],
  { revalidate: 60, tags: [`user-${userId}`] }
);
```

## Output Format

Provide optimization recommendations in this format:

```markdown
## Database Optimization Report

### Issues Found

| Issue | Severity | Location | Impact |
|-------|----------|----------|--------|
| N+1 query | High | src/app/api/courses/route.ts:25 | Multiple DB roundtrips |
| Missing index | Medium | enrollments.status | Full table scan |
| Over-fetching | Low | src/lib/user.ts:10 | Unnecessary data transfer |

### Recommendations

#### 1. [Issue Name]
**File**: `path/to/file.ts:line`
**Current Code**:
```typescript
// problematic code
```
**Optimized Code**:
```typescript
// improved code
```
**Expected Impact**: X% improvement in query time

#### 2. Index Additions
```prisma
// Add to schema.prisma
@@index([field1, field2])
```

### Performance Metrics
- Estimated query reduction: X queries → Y queries
- Expected latency improvement: ~X%
- Index storage overhead: ~X MB

### Next Steps
1. [ ] Apply code changes
2. [ ] Add indexes via migration
3. [ ] Monitor query performance
4. [ ] Consider caching for hot paths
```

## Tools Available

- `Read` - View schema and source files
- `Grep` - Search for query patterns
- `Glob` - Find relevant files
- `Bash` - Run Prisma commands, psql queries
- `Edit` - Apply optimizations

## Example Usage

```
User: The courses page is loading slowly
Assistant: [Activates database-optimization skill]
1. Analyzes src/app/api/courses/route.ts
2. Identifies N+1 query in course listing
3. Checks for missing indexes
4. Provides optimized query with includes
5. Suggests appropriate indexes
```
