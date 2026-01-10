# Prisma Rules

These rules apply to all database operations using Prisma ORM.

## Schema Location

- Schema: `prisma/schema.prisma`
- Generated Client: `src/generated/prisma/`
- Migrations: `prisma/migrations/`

## Import Pattern

```typescript
import { prisma } from '@/lib/prisma';
import type { User, Course } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
```

## Query Patterns

### Find Unique

```typescript
const user = await prisma.users.findUnique({
  where: { id: userId },
});

// With relations
const user = await prisma.users.findUnique({
  where: { id: userId },
  include: {
    enrollments: true,
  },
});
```

### Find Many with Pagination

```typescript
const [items, total] = await Promise.all([
  prisma.course.findMany({
    where: { status: 'published' },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  prisma.course.count({
    where: { status: 'published' },
  }),
]);
```

### Select Only Needed Fields

```typescript
// ✅ Good - select specific fields
const user = await prisma.users.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
  },
});

// ❌ Avoid - fetches all fields
const user = await prisma.users.findUnique({
  where: { id: userId },
});
```

### Include Related Data

```typescript
// ✅ Good - single query with include
const course = await prisma.course.findUnique({
  where: { id: courseId },
  include: {
    course_translations: {
      where: { locale: userLocale },
    },
    modules: {
      orderBy: { order: 'asc' },
    },
  },
});

// ❌ Bad - N+1 queries
const course = await prisma.course.findUnique({ where: { id } });
const translations = await prisma.course_translations.findMany({
  where: { courseId: course.id },
});
```

### Count Related Records

```typescript
const courses = await prisma.course.findMany({
  select: {
    id: true,
    slug: true,
    _count: {
      select: { enrollments: true },
    },
  },
});
// Access: course._count.enrollments
```

## Mutations

### Create

```typescript
const user = await prisma.users.create({
  data: {
    email: validated.email,
    name: validated.name,
    password: hashedPassword,
    updatedAt: new Date(),
  },
});
```

### Update

```typescript
const user = await prisma.users.update({
  where: { id: userId },
  data: {
    name: validated.name,
    updatedAt: new Date(),
  },
});
```

### Delete

```typescript
await prisma.users.delete({
  where: { id: userId },
});
```

### Upsert

```typescript
const enrollment = await prisma.enrollments.upsert({
  where: {
    userId_courseId: { userId, courseId },
  },
  create: {
    userId,
    courseId,
    status: 'active',
    updatedAt: new Date(),
  },
  update: {
    status: 'active',
    updatedAt: new Date(),
  },
});
```

## Transactions

```typescript
// Array syntax
await prisma.$transaction([
  prisma.enrollments.create({ data: enrollmentData }),
  prisma.course_progress.create({ data: progressData }),
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
  const enrollment = await tx.enrollments.create({ data: enrollmentData });
  await tx.course_progress.create({
    data: { ...progressData, enrollmentId: enrollment.id },
  });
  return enrollment;
});
```

## Error Handling

```typescript
import { Prisma } from '@/generated/prisma/client';

try {
  await prisma.users.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        throw new Error('Email already exists');
      case 'P2025': // Record not found
        throw new Error('Resource not found');
      case 'P2003': // Foreign key constraint failed
        throw new Error('Invalid reference');
    }
  }
  throw error;
}
```

## Type Safety

### Using Generated Types

```typescript
import type { Course, Prisma } from '@/generated/prisma/client';

// For complex queries
type CourseWithTranslations = Prisma.CourseGetPayload<{
  include: {
    course_translations: true;
    modules: true;
  };
}>;
```

### Input Types

```typescript
type CreateUserInput = Prisma.usersCreateInput;
type UpdateUserInput = Prisma.usersUpdateInput;
```

## Translation Pattern

```typescript
// Fetch with locale and fallback
const course = await prisma.course.findUnique({
  where: { id: courseId },
  include: {
    course_translations: {
      where: {
        OR: [
          { locale: userLocale },
          { locale: 'en' }, // Fallback
        ],
      },
      orderBy: {
        locale: userLocale === 'en' ? 'asc' : 'desc',
      },
      take: 1,
    },
  },
});

const translation = course?.course_translations[0];
const title = translation?.title || 'Untitled';
```

## Commands

```bash
# Generate client after schema changes
bunx prisma generate

# Push schema to database (dev)
bunx prisma db push

# Create migration
bunx prisma migrate dev --name description

# Apply migrations (production)
bunx prisma migrate deploy

# Open database browser
bunx prisma studio

# Validate schema
bunx prisma validate
```

## Best Practices

### Do

- Use `select` to fetch only needed fields
- Use `include` instead of separate queries
- Use transactions for related operations
- Handle Prisma errors specifically
- Use generated types for type safety
- Add indexes for frequently queried fields

### Don't

- Don't fetch all fields when only some are needed
- Don't create N+1 query patterns
- Don't skip error handling
- Don't use raw SQL unless necessary
- Don't forget `updatedAt` on mutations
