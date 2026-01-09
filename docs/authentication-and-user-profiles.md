# Authentication, User Profiles & Internationalization Guide

Complete guide for implementing user authentication, profiles, and language preferences with PostgreSQL, Prisma,
Auth.js, and next-intl.

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Dependencies & Setup](#dependencies--setup)
3. [Database Schema](#database-schema)
4. [Authentication Configuration](#authentication-configuration)
5. [User Profile Management](#user-profile-management)
6. [Internationalization Integration](#internationalization-integration)
7. [Protected Routes & Middleware](#protected-routes--middleware)
8. [API Endpoints](#api-endpoints)
9. [UI Components](#ui-components)
10. [Best Practices](#best-practices)
11. [Deployment Considerations](#deployment-considerations)

---

## Overview & Architecture

### Architecture Diagram

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#bfdbfe', 'primaryTextColor': '#000000', 'primaryBorderColor': '#3b82f6', 'lineColor': '#000000', 'secondaryColor': '#ddd6fe', 'tertiaryColor': '#a5f3fc', 'background': '#ffffff', 'textColor': '#000000', 'edgeLabelBackground': '#e2e8f0', 'fontFamily': 'system-ui, -apple-system, sans-serif'}}}%%
graph TD
    User["User"] -->|1. Login/Register| Auth["Auth.js"]
    Auth -->|2. Validate| DB1[("PostgreSQL<br/>Check credentials")]
    DB1 -->|3. Valid| Session["Create Session<br/>with user data"]
    Session -->|4. Store| DB2[("PostgreSQL<br/>_prisma_sessions")]

    Request["User Request"] -->|5. Middleware| Middleware["Check Session<br/>Get locale"]
    Middleware -->|6. Load locale| Config["next-intl config"]
    Config -->|7. Load messages| Messages["messages/[locale].json"]
    Messages -->|8. Render page| Page["Page in user's language"]

    UserProfile["User Profile Page"] -->|9. Update language| API["PATCH /api/user/language"]
    API -->|10. Save| DB3[("PostgreSQL<br/>Update user locale")]
    DB3 -->|11. Reflect| Page

    style User fill:#bfdbfe,stroke:#2563eb,color:#000000,stroke-width:2px
    style Auth fill:#a5f3fc,stroke:#0891b2,color:#000000,stroke-width:2px
    style DB1 fill:#ddd6fe,stroke:#7c3aed,color:#000000,stroke-width:2px
    style Session fill:#a5f3fc,stroke:#0891b2,color:#000000,stroke-width:2px
    style DB2 fill:#ddd6fe,stroke:#7c3aed,color:#000000,stroke-width:2px
    style Request fill:#bfdbfe,stroke:#2563eb,color:#000000,stroke-width:2px
    style Middleware fill:#fde68a,stroke:#d97706,color:#000000,stroke-width:2px
    style Config fill:#a5f3fc,stroke:#0891b2,color:#000000,stroke-width:2px
    style Messages fill:#ddd6fe,stroke:#7c3aed,color:#000000,stroke-width:2px
    style Page fill:#bbf7d0,stroke:#16a34a,color:#000000,stroke-width:2px
    style UserProfile fill:#bfdbfe,stroke:#2563eb,color:#000000,stroke-width:2px
    style API fill:#fed7aa,stroke:#ea580c,color:#000000,stroke-width:2px
    style DB3 fill:#ddd6fe,stroke:#7c3aed,color:#000000,stroke-width:2px

    linkStyle default stroke:#000000,stroke-width:2px
```

### Key Integration Points

- **Auth.js** manages authentication and sessions
- **PostgreSQL** stores user data including language preference
- **Prisma** provides type-safe database access
- **next-intl** uses user's locale from session
- **Middleware** orchestrates auth + locale routing

---

## Dependencies & Setup

### Step 1: Install Dependencies

```bash
bun add next-auth@beta
bun add -D @auth/prisma-adapter
bun add prisma @prisma/client
```

### Step 2: Set Up Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://admin:academy2026@postgres:5432/academy"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### Step 3: Initialize Prisma

```bash
bun prisma init
```

---

## Database Schema

### Complete Prisma Schema

```graphql
// prisma/schema.prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ============================================
// Authentication Models
// ============================================

model User {
  id            String    @id @default(dbgenerated("uuidv7()")) @db.Uuid
  email         String?   @unique
  emailVerified DateTime?
  name          String?
  password      String?   // For email/password auth
  avatar        String?
  bio           String?

  // Internationalization & Preferences
  locale        String    @default("en")
  timezone      String    @default("UTC")

  // Account Status
  status        String    @default("active") // active, suspended, deleted
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  enrollments   Enrollment[]
  courseProgress CourseProgress[]

  @@index([email])
  @@index([locale])
  @@map("users")
}

model Account {
  id                 String  @id @default(dbgenerated("uuidv7()")) @db.Uuid
  userId             String  @db.Uuid
  type               String  // "oauth" or "email"
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  sessionToken String   @unique
  userId       String  @db.Uuid
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}

// ============================================
// Course & Content Models
// ============================================

model Course {
  id          String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  slug        String   @unique
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  translations CourseTranslation[]
  modules      Module[]
  instructors  Instructor[]
  enrollments  Enrollment[]
  progress     CourseProgress[]
}

model CourseTranslation {
  id             String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  courseId       String  @db.Uuid
  locale         String
  title          String
  description    String
  content        String   @db.Text
  thumbnail      String?
  seoTitle       String?
  seoDescription String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([courseId, locale])
  @@index([locale])
  @@index([courseId])
  @@map("course_translations")
}

model Module {
  id        String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  courseId  String  @db.Uuid
  order     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  course       Course             @relation(fields: [courseId], references: [id], onDelete: Cascade)
  translations ModuleTranslation[]
  lessons      Lesson[]

  @@index([courseId])
  @@map("modules")
}

model ModuleTranslation {
  id          String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  moduleId    String  @db.Uuid
  locale      String
  title       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@unique([moduleId, locale])
  @@map("module_translations")
}

model Lesson {
  id        String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  moduleId  String  @db.Uuid
  order     Int
  videoUrl  String?
  duration  Int?     // in minutes
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  module       Module             @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  translations LessonTranslation[]

  @@index([moduleId])
  @@map("lessons")
}

model LessonTranslation {
  id        String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  lessonId  String  @db.Uuid
  locale    String
  title     String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([lessonId, locale])
  @@map("lesson_translations")
}

model Instructor {
  id      String @id @default(dbgenerated("uuidv7()")) @db.Uuid
  name    String
  email   String @unique
  bio     String?
  avatar  String?

  courses Course[]

  @@map("instructors")
}

// ============================================
// Enrollment & Progress Tracking
// ============================================

model Enrollment {
  id        String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  userId    String  @db.Uuid
  courseId  String  @db.Uuid
  status    String   @default("active") // active, completed, dropped
  progress  Int      @default(0)        // 0-100 percentage
  completedAt DateTime?
  enrolledAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([status])
  @@map("enrollments")
}

model CourseProgress {
  id              String   @id @default(dbgenerated("uuidv7()")) @db.Uuid
  userId          String  @db.Uuid
  courseId        String  @db.Uuid
  lessonId        String?
  modulesComplete Int      @default(0)
  lessonsComplete Int      @default(0)
  lastAccessedAt  DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
  @@index([userId])
  @@map("course_progress")
}
```

### Prisma 7 Configuration

For Prisma 7+, the database URL is configured in `prisma.config.ts` instead of the schema file:

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

Make sure your `.env.local` has:

```bash
DATABASE_URL="postgresql://admin:academy2026@postgres:5432/academy"
```

### Run Migrations

```bash
bun prisma migrate dev --name init
```

## To Do

- Creating API endpoints?
- Setting up authentication with Auth.js?
- Building UI components?

---

## Authentication Configuration

### Auth.js Configuration

**`auth.ts`**

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // OAuth Providers
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // Email/Password Provider
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add user locale to JWT
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { locale: true },
        });
        token.locale = dbUser?.locale || 'en';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.locale = (token.locale as string) || 'en';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
```

### Route Handler for Auth

**`app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

### Update NextAuth Types

**`types/next-auth.d.ts`**

```typescript
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      locale: string;
    } & DefaultSession['user'];
  }

  interface User {
    locale: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    locale: string;
  }
}
```

---

## User Profile Management

### Utility Functions

**`lib/user.ts`**

```typescript
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      locale: 'en',
    },
  });
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    bio?: string;
    avatar?: string;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function updateUserLocale(userId: string, locale: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { locale },
  });
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      avatar: true,
      locale: true,
      timezone: true,
      createdAt: true,
    },
  });
}

export async function getUserEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          translations: {
            select: { title: true, description: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });
}
```

---

## Internationalization Integration

### Enhanced i18n Config with Auth

**`src/i18n/request.ts`**

```typescript
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { locales } from './config';

export default getRequestConfig(async ({ locale, requestLocale }) => {
  // Validate locale parameter
  if (!locales.includes(locale as any)) notFound();

  // Try to get user's preferred locale from session
  let messages;

  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (e) {
    notFound();
  }

  return {
    messages,
  };
});
```

### Translation Messages with Auth Keys

**`src/messages/en.json`** (partial)

```json
{
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "email": "Email",
    "password": "Password",
    "name": "Full Name",
    "signInWithGithub": "Sign in with GitHub",
    "signInWithGoogle": "Sign in with Google",
    "dontHaveAccount": "Don't have an account?",
    "alreadyHaveAccount": "Already have an account?",
    "createAccount": "Create Account",
    "forgotPassword": "Forgot password?",
    "resetPassword": "Reset Password",
    "errors": {
      "invalidEmail": "Please enter a valid email",
      "passwordRequired": "Password is required",
      "passwordTooShort": "Password must be at least 8 characters",
      "userExists": "User with this email already exists",
      "invalidCredentials": "Invalid email or password",
      "unexpectedError": "An unexpected error occurred"
    }
  },
  "profile": {
    "settings": "Profile Settings",
    "editProfile": "Edit Profile",
    "language": "Language",
    "timezone": "Timezone",
    "currentLanguage": "Current Language",
    "selectLanguage": "Select your preferred language",
    "saved": "Settings saved successfully"
  }
}
```

---

## Protected Routes & Middleware

### Updated Middleware with Auth + i18n

**`middleware.ts`**

```typescript
import createIntlMiddleware from 'next-intl/middleware';
import { auth } from '@/auth';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ['/dashboard', '/courses', '/settings', '/profile'];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // Check if route requires authentication
  const isProtected = protectedRoutes.some((route) => pathname.includes(route));

  if (isProtected && !req.auth) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Apply i18n middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Protect dashboard routes
    '/(en|es|pt|hi|zh|de|hu)/dashboard/:path*',
    '/(en|es|pt|hi|zh|de|hu)/courses/:path*',
    '/(en|es|pt|hi|zh|de|hu)/settings/:path*',
    '/(en|es|pt|hi|zh|de|hu)/profile/:path*',
    // All other routes
    '/(en|es|pt|hi|zh|de|hu)/:path*',
    // Catch locale prefix
    '/',
    // Exclude API and special routes
    '/((?!api|_next|.*\\..*).*)',
  ],
};
```

### Server-Side Route Protection

**`lib/auth-utils.ts`**

```typescript
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

export async function getUser() {
  const session = await auth();
  return session?.user;
}

export async function getUserOrNull() {
  const session = await auth();
  return session?.user || null;
}
```

---

## API Endpoints

### User Profile API

**`app/api/user/profile/route.ts`**

```typescript
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        locale: true,
        timezone: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, bio, avatar } = await req.json();

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(avatar && { avatar }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
```

### Language Preference API

**`app/api/user/language/route.ts`**

```typescript
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { locale } = await req.json();

  // Validate locale
  const validLocales = ['en', 'es', 'pt', 'hi', 'zh', 'de', 'hu'];
  if (!validLocales.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { locale },
    });

    return NextResponse.json({ success: true, locale: user.locale });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update language' }, { status: 500 });
  }
}
```

### Enrollments API

**`app/api/user/enrollments/route.ts`**

```typescript
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            translations: {
              where: { locale: session.user.locale || 'en' },
              select: { title: true, description: true, thumbnail: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await req.json();

  try {
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
  }
}
```

---

## UI Components

### Login Page

**`app/[locale]/login/page.tsx`**

```typescript
'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useState } from 'react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('errors.invalidCredentials'));
      } else {
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-24">
      <h1 className="text-3xl font-bold">{t('login')}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && <div className="rounded bg-red-50 p-4 text-red-800">{error}</div>}

        <div>
          <label className="block text-sm font-medium">{t('email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? t('login') + '...' : t('login')}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => signIn('github')}
          className="w-full rounded border px-4 py-2"
        >
          {t('signInWithGithub')}
        </button>
        <button
          onClick={() => signIn('google')}
          className="w-full rounded border px-4 py-2"
        >
          {t('signInWithGoogle')}
        </button>
      </div>
    </div>
  );
}
```

### User Profile Component

**`app/[locale]/profile/page.tsx`**

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { data: session, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch('/api/user/profile');
    const data = await res.json();
    setProfile(data);
  };

  const handleLanguageChange = async (newLocale: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      });

      if (res.ok) {
        await update({ locale: newLocale });
        router.push('/profile', { locale: newLocale });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return <div>{t('settings')}</div>;
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="text-3xl font-bold">{t('settings')}</h1>

      {profile && (
        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="mt-1 w-full rounded border bg-gray-50 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">{t('language')}</label>
            <select
              value={profile.locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="hi">हिन्दी</option>
              <option value="zh">中文</option>
              <option value="de">Deutsch</option>
              <option value="hu">Magyar</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
```

### User Menu Component

**`components/UserMenu.tsx`**

```typescript
'use client';

import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useState } from 'react';

export default function UserMenu() {
  const t = useTranslations('auth');
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user) {
    return (
      <Link href="/login" className="px-4 py-2">
        {t('login')}
      </Link>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2">
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span>{session.user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded shadow-lg">
          <Link href="/profile" className="block px-4 py-2">
            {t('settings')}
          </Link>
          <button
            onClick={() => signOut()}
            className="block w-full px-4 py-2 text-left"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Session Security

```typescript
// Validate user exists before operations
export async function validateUserSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true },
  });

  return user?.status === 'active';
}
```

### 2. Rate Limiting for Auth

```typescript
// Use a package like `ratelimit`
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'),
});

// In auth endpoint
const { success } = await ratelimit.limit(`auth:${email}`);
```

### 3. Locale Validation

```typescript
const VALID_LOCALES = ['en', 'es', 'pt', 'hi', 'zh', 'de', 'hu'] as const;

function isValidLocale(locale: unknown): locale is (typeof VALID_LOCALES)[number] {
  return VALID_LOCALES.includes(locale as any);
}
```

### 4. User Data Privacy

```typescript
// Never expose sensitive data
export async function getUserPublicProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      createdAt: true,
      // Exclude: email, password, etc.
    },
  });
}
```

### 5. Audit Logging

```typescript
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  resource  String
  details   Json?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}

// Usage
async function logAction(userId: string, action: string, details?: any) {
  await prisma.auditLog.create({
    data: { userId, action, resource: 'user', details },
  });
}
```

---

## Deployment Considerations

### Production Environment Variables

```bash
# .env.production
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# OAuth providers
GITHUB_ID="..."
GITHUB_SECRET="..."
GOOGLE_ID="..."
GOOGLE_SECRET="..."
```

### Database Backup Strategy

```bash
# Automated daily backups
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
```

### Session Management

```typescript
// Configure appropriate session timeout
export const { handlers, auth } = NextAuth({
  // ... other config
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update every 24 hours
  },
});
```

### HTTPS & Secure Cookies

- Always use HTTPS in production
- Set secure and sameSite flags for cookies
- Use CSRF protection (handled by Next.js)

---

## Summary

This setup provides:

✅ **Robust Authentication** with email/password and OAuth ✅ **User Profiles** with customizable preferences ✅
**Language Selection** stored per user ✅ **Protected Routes** requiring authentication ✅ **i18n Integration**
respecting user preferences ✅ **Progress Tracking** for course enrollments ✅ **Audit Logging** for compliance ✅
**Type Safety** with Prisma and TypeScript

All integrated seamlessly with next-intl for a truly personalized experience!

---

## API Endpoint Architecture

### Understanding the Components

When building API endpoints, it's important to understand that these aren't separate alternatives - they should **all be
used together**:

**What they actually are:**

1. **Traditional REST endpoints** - The architectural pattern (GET, POST, PATCH, DELETE HTTP methods)
2. **Using Next.js App Router API routes** - WHERE you implement them (`/app/api/*` directory structure)
3. **With proper error handling & validation** - A QUALITY standard (input validation, error responses, logging)
4. **Type-safe with Prisma** - TYPE SAFETY throughout (TypeScript types + Prisma generated types)

### Recommended Approach

The **RIGHT approach combines all of them:**

✅ **REST endpoints** - Standard HTTP verbs (GET /api/courses, POST /api/enrollments, etc.) ✅ **In Next.js App
Router** - Located in `/app/api/courses/route.ts`, `/app/api/enrollments/route.ts` ✅ **With validation & error
handling** - Using Zod for input validation and structured error responses ✅ **Type-safe with Prisma** - End-to-end
TypeScript + Prisma Client for database queries

### Pros of Combined Approach

- Type-safe end-to-end (schema → database → API → client)
- Next.js handles routing automatically
- Built-in middleware support
- Easy to integrate with Auth.js for authentication
- Better developer experience and fewer bugs

### Phase 1 Implementation Plan

Create all essential endpoints using:

- ✅ Next.js App Router API routes
- ✅ Prisma for type-safe database queries
- ✅ Zod for input validation
- ✅ Proper error handling with structured responses
- ✅ Authentication guards where needed

**Endpoints to create:**

- User Management (profile, language preference)
- Courses (list, get by ID with translations)
- Enrollments (list, create, get progress)
- Progress tracking (update course progress)

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
