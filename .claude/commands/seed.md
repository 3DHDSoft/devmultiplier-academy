# Database Seed

Populate the database with development or test data.

## Instructions

Create and run database seed scripts for development and testing.

### Step 1: Check Current State

```bash
# Check if database has data
bunx prisma studio

# Or via psql
psql -h postgres -U devuser -d devdb -c "SELECT COUNT(*) FROM users;"
```

### Step 2: Create Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (optional)
  await prisma.enrollments.deleteMany();
  await prisma.course_progress.deleteMany();
  await prisma.lesson_translations.deleteMany();
  await prisma.lessons.deleteMany();
  await prisma.module_translations.deleteMany();
  await prisma.modules.deleteMany();
  await prisma.course_translations.deleteMany();
  await prisma.course.deleteMany();
  await prisma.users.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.users.create({
    data: {
      email: 'admin@devmultiplier.com',
      name: 'Admin User',
      password: adminPassword,
      isAdmin: true,
      emailVerified: new Date(),
      locale: 'en',
      timezone: 'UTC',
      status: 'active',
      updatedAt: new Date(),
    },
  });
  console.log(`👤 Created admin: ${admin.email}`);

  // Create test users
  const testPassword = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.users.create({
      data: {
        email: 'student@example.com',
        name: 'Test Student',
        password: testPassword,
        emailVerified: new Date(),
        locale: 'en',
        timezone: 'America/New_York',
        status: 'active',
        updatedAt: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'student.es@example.com',
        name: 'Estudiante Prueba',
        password: testPassword,
        emailVerified: new Date(),
        locale: 'es',
        timezone: 'Europe/Madrid',
        status: 'active',
        updatedAt: new Date(),
      },
    }),
  ]);
  console.log(`👥 Created ${users.length} test users`);

  // Create courses
  const courses = await Promise.all([
    createCourseWithContent(prisma, {
      slug: 'domain-driven-design',
      status: 'published',
      translations: {
        en: {
          title: 'Domain-Driven Design Fundamentals',
          description: 'Learn DDD patterns and strategic design.',
          content: 'Complete guide to DDD...',
        },
        es: {
          title: 'Fundamentos de Diseño Dirigido por Dominio',
          description: 'Aprende patrones DDD y diseño estratégico.',
          content: 'Guía completa de DDD...',
        },
      },
      modules: [
        {
          order: 1,
          translations: {
            en: { title: 'Introduction to DDD', description: 'Overview of DDD concepts' },
            es: { title: 'Introducción a DDD', description: 'Visión general de conceptos DDD' },
          },
          lessons: [
            { order: 1, duration: 600, translations: { en: { title: 'What is DDD?', content: '...' } } },
            { order: 2, duration: 900, translations: { en: { title: 'Strategic vs Tactical', content: '...' } } },
          ],
        },
        {
          order: 2,
          translations: {
            en: { title: 'Bounded Contexts', description: 'Define system boundaries' },
          },
          lessons: [
            { order: 1, duration: 1200, translations: { en: { title: 'Context Mapping', content: '...' } } },
          ],
        },
      ],
    }),
    createCourseWithContent(prisma, {
      slug: 'clean-architecture',
      status: 'published',
      translations: {
        en: {
          title: 'Clean Architecture with TypeScript',
          description: 'Build maintainable applications.',
          content: 'Master clean architecture...',
        },
      },
      modules: [
        {
          order: 1,
          translations: {
            en: { title: 'Architecture Principles', description: 'Core concepts' },
          },
          lessons: [
            { order: 1, duration: 800, translations: { en: { title: 'SOLID Principles', content: '...' } } },
          ],
        },
      ],
    }),
  ]);
  console.log(`📚 Created ${courses.length} courses`);

  // Create enrollments
  const enrollments = await Promise.all([
    prisma.enrollments.create({
      data: {
        userId: users[0].id,
        courseId: courses[0].id,
        status: 'active',
        progress: 25,
        updatedAt: new Date(),
      },
    }),
    prisma.enrollments.create({
      data: {
        userId: users[1].id,
        courseId: courses[0].id,
        status: 'active',
        progress: 50,
        updatedAt: new Date(),
      },
    }),
  ]);
  console.log(`📝 Created ${enrollments.length} enrollments`);

  console.log('✅ Seed completed!');
}

// Helper function to create course with nested content
async function createCourseWithContent(prisma: PrismaClient, data: CourseData) {
  const course = await prisma.course.create({
    data: {
      slug: data.slug,
      status: data.status,
      updatedAt: new Date(),
    },
  });

  // Create translations
  for (const [locale, trans] of Object.entries(data.translations)) {
    await prisma.course_translations.create({
      data: {
        courseId: course.id,
        locale,
        title: trans.title,
        description: trans.description,
        content: trans.content,
        updatedAt: new Date(),
      },
    });
  }

  // Create modules
  for (const moduleData of data.modules) {
    const module = await prisma.modules.create({
      data: {
        courseId: course.id,
        order: moduleData.order,
        updatedAt: new Date(),
      },
    });

    for (const [locale, trans] of Object.entries(moduleData.translations)) {
      await prisma.module_translations.create({
        data: {
          moduleId: module.id,
          locale,
          title: trans.title,
          description: trans.description,
          updatedAt: new Date(),
        },
      });
    }

    // Create lessons
    for (const lessonData of moduleData.lessons || []) {
      const lesson = await prisma.lessons.create({
        data: {
          moduleId: module.id,
          order: lessonData.order,
          duration: lessonData.duration,
          updatedAt: new Date(),
        },
      });

      for (const [locale, trans] of Object.entries(lessonData.translations)) {
        await prisma.lesson_translations.create({
          data: {
            lessonId: lesson.id,
            locale,
            title: trans.title,
            content: trans.content,
            updatedAt: new Date(),
          },
        });
      }
    }
  }

  return course;
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Step 3: Configure package.json

```json
{
  "prisma": {
    "seed": "bun prisma/seed.ts"
  }
}
```

### Step 4: Run Seed

```bash
# Run seed script
bunx prisma db seed

# Or reset database and seed
bunx prisma migrate reset  # Includes seeding

# Run seed manually
bun prisma/seed.ts
```

## Test Data Sets

### Minimal (Quick Testing)
- 1 admin user
- 1 test user
- 1 course with 1 module and 2 lessons

### Standard (Development)
- 1 admin user
- 5 test users (various locales)
- 3 courses with full content
- Sample enrollments and progress

### Full (Demo/Staging)
- Multiple admin users
- 20+ users with varied profiles
- 10+ courses across categories
- Realistic enrollment distribution
- Progress data for analytics testing

## Usage

```bash
# Run default seed
/seed

# Reset and seed
/seed reset

# Seed specific data
/seed users
/seed courses
```

## Seed Data Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@devmultiplier.com | admin123456 | Admin |
| student@example.com | password123 | Student |
| student.es@example.com | password123 | Student (ES) |

⚠️ **Warning**: Never use these credentials in production!
