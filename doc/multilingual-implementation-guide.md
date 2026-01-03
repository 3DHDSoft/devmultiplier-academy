# Multilingual Implementation Guide for DevMultiplier Academy

## Table of Contents

1. [Recommended Languages to Start](#recommended-languages-to-start)
2. [Recommended Approach: next-intl](#recommended-approach)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation-setup)
5. [Implementation Examples](#implementation-examples)
6. [Course Content Management](#course-content-management)
7. [Best Practices](#best-practices)
8. [SEO Considerations](#seo-considerations)

---

## Recommended Languages to Start

Based on the developer market and your AI/tech focus, here's the recommendation:

### **Tier 1 - Start with these (2-3 languages):**

1. **English** - Primary language, largest tech market
2. **Spanish** - 2nd most spoken language globally, growing tech markets in Latin America and Spain
3. **Portuguese** - Brazilian tech market is booming, large developer community

### **Tier 2 - Add next (4-7 total):**

4. **Hindi** - Massive Indian developer market, fastest-growing tech economy
5. **Chinese (Simplified)** - Huge market, strong in AI/tech development
6. **German** - Strong European tech market, high purchasing power
7. **Hungarian** - Central/Eastern European market, strong programming culture and education

**Why Hungarian?**

- Hungary has a strong tradition in mathematics and computer science education
- High concentration of software developers per capita in Central Europe
- Gateway to Central/Eastern European markets (similar linguistic patterns help with Czech, Slovak, Polish, Romanian)
- Growing tech hub in Budapest
- Hungarian developers are known for their strong technical skills
- Cost-effective market with high engagement potential

### **Tier 3 - Expand to (8-10 total):**

8. **French** - European + African markets
9. **Japanese** - Advanced tech market, high-value customers
10. **Korean** - Strong tech industry, enthusiastic learners
11. **Russian** - Large developer community in Eastern Europe

**Recommendation: Start with English + Spanish + Portuguese, then add Hungarian in Tier 2**

---

## Recommended Approach: next-intl

For Next.js 13+ (App Router), I recommend **next-intl** over the built-in i18n routing because it:

- Works seamlessly with App Router
- Better TypeScript support
- Easier nested translations
- Built-in pluralization and formatting
- Server Components compatible

### Alternative Options:

- **next-i18next** - Good for Pages Router (older Next.js)
- **Paraglide JS** - New, lightweight option
- **Built-in Next.js i18n** - Only works with Pages Router (deprecated in App Router)

---

## Project Structure

### Current Structure

```
dev-x-academy-web/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   └── page.tsx
│   │   └── pricing/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── footer.tsx
│   │   │   └── header.tsx
│   │   ├── sections/
│   │   │   ├── courses.tsx
│   │   │   ├── cta.tsx
│   │   │   ├── hero.tsx
│   │   │   └── pricing.tsx
│   │   └── ui/
│   │       └── button.tsx
│   └── lib/
│       └── utils.ts
├── public/
├── doc/
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── .prettierrc                       # Prettier configuration
```

### Target Structure (After Implementation)

```
dev-x-academy-web/
├── src/
│   ├── app/
│   │   ├── [locale]/                # Locale-based routing (NEW)
│   │   │   ├── layout.tsx           # Root layout with locale (MODIFIED)
│   │   │   ├── page.tsx             # Home page (MOVED)
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     # NEW: Individual course pages
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── privacy-policy/      # NEW
│   │   │   │   └── page.tsx
│   │   │   └── terms-of-service/    # NEW
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── ...
│   ├── components/
│   │   ├── LanguageSwitcher.tsx     # NEW
│   │   ├── layout/
│   │   │   ├── footer.tsx
│   │   │   └── header.tsx
│   │   ├── sections/
│   │   │   ├── courses.tsx
│   │   │   ├── cta.tsx
│   │   │   ├── hero.tsx
│   │   │   └── pricing.tsx
│   │   └── ui/
│   │       └── button.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── i18n/                        # NEW: i18n configuration
│   │   ├── config.ts
│   │   ├── request.ts
│   │   └── routing.ts
│   └── middleware.ts                # NEW: Locale detection & routing
├── messages/                         # NEW: Translation files
│   ├── en.json
│   ├── es.json
│   ├── pt.json
│   ├── hi.json
│   ├── zh.json
│   ├── de.json
│   └── hu.json
├── public/
├── doc/
├── .prettierrc
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Installation & Setup

### Step 1: Install Dependencies

```bash
bun add next-intl
```

### Step 2: Configure i18n

**`i18n/config.ts`**

```typescript
export const locales = ['en', 'es', 'pt', 'hi', 'zh', 'de', 'hu'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  hi: 'हिन्दी',
  zh: '中文',
  de: 'Deutsch',
  hu: 'Magyar',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  pt: '🇧🇷',
  hi: '🇮🇳',
  zh: '🇨🇳',
  de: '🇩🇪',
  hu: '🇭🇺',
};
```

**`i18n/request.ts`**

```typescript
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

**`i18n/routing.ts`**

```typescript
import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // or 'always' to force /en/... for English too
});

// Lightweight wrappers around Next.js' navigation APIs
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation(routing);
```

### Step 3: Middleware Configuration

**`middleware.ts`**

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (internal Next.js routes)
  // - static files
  matcher: ['/', '/(en|es|pt|hi|zh|de|hu)/:path*', '/((?!api|_next|.*\\..*).*)'],
};
```

### Step 4: Root Layout Configuration

**`app/[locale]/layout.tsx`**

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

## Implementation Examples

### Translation Files

**`messages/en.json`**

```json
{
  "common": {
    "home": "Home",
    "courses": "Courses",
    "about": "About",
    "contact": "Contact",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "learnMore": "Learn More",
    "enroll": "Enroll Now"
  },
  "navigation": {
    "language": "Language"
  },
  "home": {
    "hero": {
      "title": "Become a 10x-100x Developer in the Age of AI",
      "subtitle": "Master Domain-Driven Design, CQRS, Database Optimization, REST APIs, and AI-Assisted Development",
      "cta": "Explore Courses"
    },
    "features": {
      "title": "Why DevMultiplier Academy?",
      "aiPowered": "AI-Powered Learning",
      "aiPoweredDesc": "Learn to leverage cutting-edge AI tools like GitHub Copilot and Claude AI",
      "handson": "Hands-On Projects",
      "handsonDesc": "Build real-world applications with modern technologies",
      "expert": "Expert Instructors",
      "expertDesc": "Learn from industry veterans with decades of experience"
    }
  },
  "courses": {
    "title": "Our Courses",
    "dddToCqrs": {
      "title": "From DDD to CQRS with AI Agents",
      "description": "Learn to design scalable systems using Domain-Driven Design and CQRS patterns with AI assistance",
      "duration": "8 weeks",
      "level": "Intermediate"
    },
    "dddToSchema": {
      "title": "DDD to Database Schema",
      "description": "Transform your domain models into efficient database schemas",
      "duration": "6 weeks",
      "level": "Intermediate"
    },
    "dbOptimization": {
      "title": "AI-Assisted Database Optimization",
      "description": "Master SQL Server 2025 and PostgreSQL 18 with AI-powered optimization techniques",
      "duration": "10 weeks",
      "level": "Advanced"
    },
    "restApi": {
      "title": "Data-Driven REST API Development",
      "description": "Build robust, scalable REST APIs with modern best practices",
      "duration": "8 weeks",
      "level": "Intermediate"
    },
    "uiDesign": {
      "title": "AI-Assisted UI Design (Next.js)",
      "description": "Create beautiful, responsive interfaces with Next.js and AI assistance",
      "duration": "10 weeks",
      "level": "Intermediate"
    }
  },
  "footer": {
    "company": "Company",
    "legal": "Legal",
    "support": "Support",
    "copyright": "© {year} DevMultiplier Academy. All rights reserved."
  }
}
```

**`messages/es.json`**

```json
{
  "common": {
    "home": "Inicio",
    "courses": "Cursos",
    "about": "Acerca de",
    "contact": "Contacto",
    "signIn": "Iniciar Sesión",
    "signUp": "Registrarse",
    "learnMore": "Saber Más",
    "enroll": "Inscribirse Ahora"
  },
  "navigation": {
    "language": "Idioma"
  },
  "home": {
    "hero": {
      "title": "Conviértete en un Desarrollador 10x-100x en la Era de la IA",
      "subtitle": "Domina el Diseño Dirigido por Dominio, CQRS, Optimización de Bases de Datos, APIs REST y Desarrollo Asistido por IA",
      "cta": "Explorar Cursos"
    },
    "features": {
      "title": "¿Por Qué DevMultiplier Academy?",
      "aiPowered": "Aprendizaje Potenciado por IA",
      "aiPoweredDesc": "Aprende a aprovechar herramientas de IA de vanguardia como GitHub Copilot y Claude AI",
      "handson": "Proyectos Prácticos",
      "handsonDesc": "Construye aplicaciones del mundo real con tecnologías modernas",
      "expert": "Instructores Expertos",
      "expertDesc": "Aprende de veteranos de la industria con décadas de experiencia"
    }
  },
  "courses": {
    "title": "Nuestros Cursos",
    "dddToCqrs": {
      "title": "De DDD a CQRS con Agentes de IA",
      "description": "Aprende a diseñar sistemas escalables usando patrones de Diseño Dirigido por Dominio y CQRS con asistencia de IA",
      "duration": "8 semanas",
      "level": "Intermedio"
    }
    // ... more courses
  },
  "footer": {
    "company": "Empresa",
    "legal": "Legal",
    "support": "Soporte",
    "copyright": "© {year} DevMultiplier Academy. Todos los derechos reservados."
  }
}
```

**`messages/hu.json`**

```json
{
  "common": {
    "home": "Kezdőlap",
    "courses": "Tanfolyamok",
    "about": "Rólunk",
    "contact": "Kapcsolat",
    "signIn": "Bejelentkezés",
    "signUp": "Regisztráció",
    "learnMore": "Tudj meg többet",
    "enroll": "Beiratkozás most"
  },
  "navigation": {
    "language": "Nyelv"
  },
  "home": {
    "hero": {
      "title": "Válj 10x-100x fejlesztővé az AI korában",
      "subtitle": "Sajátítsd el a Domain-Driven Design-t, CQRS-t, adatbázis optimalizálást, REST API-kat és az AI-asszisztált fejlesztést",
      "cta": "Tanfolyamok böngészése"
    },
    "features": {
      "title": "Miért a DevMultiplier Academy?",
      "aiPowered": "AI-alapú tanulás",
      "aiPoweredDesc": "Tanuld meg használni a legmodernebb AI eszközöket, mint a GitHub Copilot és Claude AI",
      "handson": "Gyakorlati projektek",
      "handsonDesc": "Építs valós alkalmazásokat modern technológiákkal",
      "expert": "Szakértő oktatók",
      "expertDesc": "Tanulj az iparág veteránjaitól, akik évtizedes tapasztalattal rendelkeznek"
    }
  },
  "courses": {
    "title": "Tanfolyamaink",
    "dddToCqrs": {
      "title": "DDD-től CQRS-ig AI ügynökökkel",
      "description": "Tanulj meg skálázható rendszereket tervezni Domain-Driven Design és CQRS mintákkal AI segítséggel",
      "duration": "8 hét",
      "level": "Haladó"
    },
    "dddToSchema": {
      "title": "DDD-től adatbázis sémáig",
      "description": "Alakítsd át domain modelleidet hatékony adatbázis sémákká",
      "duration": "6 hét",
      "level": "Haladó"
    },
    "dbOptimization": {
      "title": "AI-asszisztált adatbázis optimalizálás",
      "description": "Sajátítsd el az SQL Server 2025-öt és PostgreSQL 18-at AI-alapú optimalizálási technikákkal",
      "duration": "10 hét",
      "level": "Szakértő"
    },
    "restApi": {
      "title": "Adatvezérelt REST API fejlesztés",
      "description": "Építs robusztus, skálázható REST API-kat modern best practice-ekkel",
      "duration": "8 hét",
      "level": "Haladó"
    },
    "uiDesign": {
      "title": "AI-asszisztált UI tervezés (Next.js)",
      "description": "Készíts gyönyörű, reszponzív felületeket Next.js-sel és AI segítséggel",
      "duration": "10 hét",
      "level": "Haladó"
    }
  },
  "footer": {
    "company": "Cég",
    "legal": "Jogi",
    "support": "Támogatás",
    "copyright": "© {year} DevMultiplier Academy. Minden jog fenntartva."
  }
}
```

### Using Translations in Components

**Server Component:**

```typescript
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home.hero');

  return (
    <section>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <button>{t('cta')}</button>
    </section>
  );
}
```

**Client Component:**

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function EnrollButton() {
  const t = useTranslations('common');

  return (
    <button onClick={() => console.log('Enrolling...')}>
      {t('enroll')}
    </button>
  );
}
```

### Language Switcher Component

**`components/LanguageSwitcher.tsx`**

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { locales, localeNames, localeFlags } from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-4 py-2 border rounded-lg bg-white"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeFlags[loc]} {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Navigation with Locale Links

```typescript
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function Navigation() {
  const t = useTranslations('common');

  return (
    <nav>
      <Link href="/">{t('home')}</Link>
      <Link href="/courses">{t('courses')}</Link>
      <Link href="/about">{t('about')}</Link>
      <Link href="/contact">{t('contact')}</Link>
    </nav>
  );
}
```

---

## Course Content Management

### Option 1: Database-Driven (Recommended for Scale)

**Best for:** Large catalogs, frequently updated content, admin dashboards, multiple editors

#### Full Schema Design

```typescript
// Database schema example (Prisma)

model Course {
  id          String   @id @default(cuid())
  slug        String   @unique
  status      String   @default('draft') // draft, published, archived
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  translations CourseTranslation[]
  modules      Module[]
  instructors  Instructor[]
}

model CourseTranslation {
  id          String   @id @default(cuid())
  courseId    String
  locale      String
  title       String
  description String
  content     String   @db.Text // Rich text or Markdown
  thumbnail   String?  // URL to thumbnail
  seoTitle    String?
  seoDescription String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([courseId, locale])
  @@index([locale])
  @@index([courseId])
}

model Module {
  id          String   @id @default(cuid())
  courseId    String
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  translations ModuleTranslation[]
  lessons     Lesson[]

  @@index([courseId])
}

model ModuleTranslation {
  id          String   @id @default(cuid())
  moduleId    String
  locale      String
  title       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@unique([moduleId, locale])
}

model Lesson {
  id          String   @id @default(cuid())
  moduleId    String
  order       Int
  videoUrl    String?
  duration    Int?     // in minutes
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  translations LessonTranslation[]

  @@index([moduleId])
}

model LessonTranslation {
  id          String   @id @default(cuid())
  lessonId    String
  locale      String
  title       String
  content     String   @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([lessonId, locale])
}

model Instructor {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  bio         String?
  avatar      String?
  createdAt   DateTime @default(now())

  courses     Course[]
}
```

#### Optimized Fetching with Caching

```typescript
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

// Cache course data for 1 hour
const getCourseWithCache = unstable_cache(
  async (slug: string, locale: string) => {
    return prisma.course.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale },
          select: {
            title: true,
            description: true,
            content: true,
            seoTitle: true,
            seoDescription: true,
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            translations: {
              where: { locale },
              select: { title: true, description: true },
            },
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                translations: {
                  where: { locale },
                  select: { title: true, content: true, duration: true },
                },
              },
            },
          },
        },
      },
    });
  },
  ['course', 'slug', 'locale'],
  {
    tags: ['course'],
    revalidate: 3600, // 1 hour
  }
);

async function getCourse(slug: string, locale: string) {
  const course = await getCourseWithCache(slug, locale);

  if (!course) {
    return null;
  }

  // Flatten for easier access
  return {
    ...course,
    title: course.translations[0]?.title,
    description: course.translations[0]?.description,
    content: course.translations[0]?.content,
  };
}

// Revalidate cache when course is updated
export async function invalidateCourseCache(courseId: string) {
  revalidateTag('course');
}
```

#### Batch Translation Updates

```typescript
// API route to update multiple translations at once
// app/api/admin/courses/[id]/translations/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  const { translations } = await req.json();

  try {
    // Update all translations in a transaction
    const result = await prisma.$transaction(
      translations.map((t: any) =>
        prisma.courseTranslation.upsert({
          where: {
            courseId_locale: {
              courseId: id,
              locale: t.locale,
            },
          },
          update: {
            title: t.title,
            description: t.description,
            content: t.content,
            seoTitle: t.seoTitle,
            seoDescription: t.seoDescription,
          },
          create: {
            courseId: id,
            locale: t.locale,
            title: t.title,
            description: t.description,
            content: t.content,
            seoTitle: t.seoTitle,
            seoDescription: t.seoDescription,
          },
        })
      )
    );

    // Revalidate all locales
    revalidateTag('course');

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Querying All Locales

```typescript
// Get all available locales for a course
async function getCourseAllLocales(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      translations: {
        select: {
          locale: true,
          title: true,
          updatedAt: true,
        },
      },
    },
  });

  return course;
}

// Check translation coverage (which locales have translations)
async function getTranslationCoverage(courseId: string) {
  const locales = ['en', 'es', 'pt', 'hi', 'zh', 'de', 'hu'];

  const translations = await prisma.courseTranslation.findMany({
    where: { courseId },
    select: { locale: true },
  });

  const available = new Set(translations.map((t) => t.locale));
  const missing = locales.filter((l) => !available.has(l));

  return {
    available: Array.from(available),
    missing,
    coverage: (available.size / locales.length) * 100,
  };
}
```

#### Performance Considerations

1. **Indexes:** Add indexes on `locale`, `courseId`, and composite unique constraints for faster queries
2. **Pagination:** For large courses, paginate modules/lessons
3. **Materialized Views:** Consider creating a denormalized view for frequently accessed data
4. **Replication:** For read-heavy applications, replicate translation data to a read replica
5. **CDN:** Cache translated content headers with cache control

#### Admin Dashboard Integration

```typescript
// Example: Get courses needing translation
async function getCoursesNeedingTranslation(locale: string) {
  return prisma.course.findMany({
    where: {
      status: 'published',
      translations: {
        none: {
          locale,
        },
      },
    },
    select: {
      id: true,
      slug: true,
      translations: {
        where: { locale: 'en' },
        select: { title: true },
      },
    },
  });
}

// Track translation completion
async function getTranslationStats() {
  const locales = ['en', 'es', 'pt', 'hi', 'zh', 'de', 'hu'];
  const stats = [];

  for (const locale of locales) {
    const count = await prisma.courseTranslation.count({ where: { locale } });
    stats.push({ locale, count });
  }

  return stats;
}
```

### Option 2: File-Based (Good for Starting)

```
content/
├── courses/
│   ├── en/
│   │   ├── ddd-to-cqrs.mdx
│   │   ├── ddd-to-schema.mdx
│   │   └── ...
│   ├── es/
│   │   ├── ddd-to-cqrs.mdx
│   │   └── ...
│   └── pt/
│       ├── ddd-to-cqrs.mdx
│       └── ...
```

**Using MDX with next-intl:**

```typescript
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

export default async function CoursePage({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations('courses');

  // Load MDX content
  const contentPath = path.join(
    process.cwd(),
    'content',
    'courses',
    locale,
    `${slug}.mdx`
  );

  try {
    const content = await fs.readFile(contentPath, 'utf-8');
    // Process and render MDX...

    return (
      <article>
        {/* Render course content */}
      </article>
    );
  } catch {
    notFound();
  }
}
```

### Option 3: Headless CMS (Best for Non-Technical Content Editors)

Popular options:

- **Sanity.io** - Great i18n support, real-time collaboration
- **Contentful** - Robust localization features
- **Strapi** - Open-source, self-hosted option
- **Payload CMS** - TypeScript-first, excellent for Next.js

**Example with Sanity:**

```typescript
// sanity/schemas/course.ts
export default {
  name: 'course',
  type: 'document',
  i18n: {
    languages: ['en', 'es', 'pt', 'hi', 'zh', 'de'],
    defaultLanguages: ['en'],
  },
  fields: [
    {
      name: 'title',
      type: 'string',
      localize: true,
    },
    {
      name: 'description',
      type: 'text',
      localize: true,
    },
    {
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
      localize: true,
    },
  ],
};
```

---

## Best Practices

### 1. Use Translation Namespaces

```json
{
  "home": { ... },
  "courses": { ... },
  "navigation": { ... },
  "footer": { ... }
}
```

### 2. Handle Pluralization

```typescript
// messages/en.json
{
  "items": {
    "count": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
  }
}

// Usage
t('items.count', { count: 5 }) // "5 items"
```

### 3. Date and Number Formatting

```typescript
import { useFormatter } from 'next-intl';

function Component() {
  const format = useFormatter();

  return (
    <div>
      <p>{format.dateTime(new Date(), { dateStyle: 'long' })}</p>
      <p>{format.number(1234.56, { style: 'currency', currency: 'USD' })}</p>
    </div>
  );
}
```

### 4. Handle Missing Translations

```typescript
// i18n/request.ts
export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    onError: (error) => {
      if (error.code === 'MISSING_MESSAGE') {
        console.warn('Missing translation:', error.message);
      }
    },
    getMessageFallback: ({ key }) => {
      return `Missing: ${key}`;
    },
  };
});
```

### 5. SEO with Alternate Links

```typescript
// app/[locale]/layout.tsx
import { routing } from '@/i18n/routing';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const messages = await getMessages();

  return {
    title: messages.meta.title,
    description: messages.meta.description,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((loc) => [loc, `/${loc}`])),
    },
  };
}
```

---

## SEO Considerations

### 1. Hreflang Tags

```typescript
// Automatically handled by Next.js metadata API
export const metadata = {
  alternates: {
    languages: {
      en: '/en',
      es: '/es',
      pt: '/pt',
      hi: '/hi',
      zh: '/zh',
      de: '/de',
      hu: '/hu',
    },
  },
};
```

### 2. Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://devmultiplier.com';

  const pages = ['', '/courses', '/about', '/contact'];

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  );
}
```

### 3. Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://devmultiplier.com/sitemap.xml',
  };
}
```

---

## Translation Workflow

### Recommended Process:

1. **Development**
   - Write content in English first
   - Use translation keys in code
   - Test with English only

2. **Professional Translation**
   - Use services like:
     - **Lokalise** - Developer-friendly, integrates with CI/CD
     - **Phrase** - Good for teams
     - **Crowdin** - Community translations
     - **DeepL API** - High-quality machine translation for drafts
3. **Quality Assurance**
   - Native speaker review
   - Context verification
   - Technical term consistency

4. **Continuous Updates**
   - Track missing translations
   - Version control translation files
   - Automated notifications for new keys

### Translation Management Script

```typescript
// scripts/check-translations.ts
import fs from 'fs';
import path from 'path';

const locales = ['en', 'es', 'pt', 'hi', 'zh', 'de', 'hu'];
const messagesDir = path.join(process.cwd(), 'messages');

function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function checkTranslations() {
  const enMessages = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8'));
  const enKeys = getAllKeys(enMessages);

  locales.forEach((locale) => {
    if (locale === 'en') return;

    const messages = JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), 'utf-8'));
    const keys = getAllKeys(messages);

    const missing = enKeys.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !enKeys.includes(key));

    console.log(`\n${locale.toUpperCase()}:`);
    if (missing.length > 0) {
      console.log('  Missing keys:', missing);
    }
    if (extra.length > 0) {
      console.log('  Extra keys:', extra);
    }
    if (missing.length === 0 && extra.length === 0) {
      console.log('  ✓ All translations up to date');
    }
  });
}

checkTranslations();
```

Run with: `bun run scripts/check-translations.ts`

---

## Performance Tips

1. **Lazy Load Translations**

   ```typescript
   const t = useTranslations('courses.dddToCqrs');
   // Only loads 'courses.dddToCqrs' namespace
   ```

2. **Static Generation**

   ```typescript
   export const dynamic = 'force-static';
   export function generateStaticParams() {
     return routing.locales.map((locale) => ({ locale }));
   }
   ```

3. **Edge Runtime for Language Detection**
   ```typescript
   // middleware.ts
   export const config = {
     matcher: ['/((?!api|_next|.*\\..*).*)'],
     runtime: 'edge',
   };
   ```

---

## Testing Multilingual Features

```typescript
// __tests__/i18n.test.tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import HomePage from '@/app/[locale]/page';

describe('Internationalization', () => {
  it('renders in English', () => {
    const messages = require('../messages/en.json');

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <HomePage />
      </NextIntlClientProvider>
    );

    expect(screen.getByText(/Become a 10x-100x Developer/i)).toBeInTheDocument();
  });

  it('renders in Spanish', () => {
    const messages = require('../messages/es.json');

    render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <HomePage />
      </NextIntlClientProvider>
    );

    expect(screen.getByText(/Conviértete en un Desarrollador/i)).toBeInTheDocument();
  });
});
```

---

## Cost Estimation for Professional Translation

**Per language (assuming ~10,000 words for website + 5 courses):**

- **Professional human translation**: $500-$1,500 per language
- **AI + human review**: $200-$600 per language
- **Maintenance**: ~$100-$300 per language per quarter

**Total for 7 languages (en, es, pt, hi, zh, de, hu):**

- Initial: $3,000-$10,500
- Yearly maintenance: $2,400-$7,200

---

## Recommended Roadmap

### Phase 1: Foundation (Weeks 1-2)

- ✅ Set up next-intl
- ✅ Implement English + Spanish
- ✅ Create translation workflow
- ✅ Test language switching

### Phase 2: Expansion (Weeks 3-4)

- ✅ Add Portuguese
- ✅ Translate 1-2 courses
- ✅ Implement SEO best practices
- ✅ Set up translation management

### Phase 3: Scale (Weeks 5-8)

- ✅ Add Hindi, Chinese, German, Hungarian
- ✅ Translate all courses
- ✅ Implement automated translation checks
- ✅ Launch multilingual marketing

---

## Summary

**Start with:**

1. English (primary)
2. Spanish (largest growth market)
3. Portuguese (Brazilian market)

**Expand in Tier 2:** 4. Hindi (Indian market) 5. Chinese (Chinese market) 6. German (European market) 7. Hungarian
(Central/Eastern European market)

**Technical stack:**

- next-intl for Next.js 13+ App Router
- Sanity.io or file-based content management
- Lokalise for translation management
- Professional translators for quality

**Key benefits:**

- 4x+ larger addressable market with 7 languages
- Better SEO in international markets
- Strong presence in Central/Eastern Europe with Hungarian
- Competitive advantage in developer education
- Higher conversion rates in native languages

This setup will give you a solid foundation to scale to 10+ languages while maintaining code quality and translation
accuracy.
