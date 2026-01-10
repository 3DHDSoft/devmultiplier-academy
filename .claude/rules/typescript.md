# TypeScript Rules

These rules apply to all TypeScript and TSX files in this project.

## Strict Mode

This project uses TypeScript strict mode. All code must pass type checking:

```bash
bun run type-check
```

### Strict Settings Enforced

- `strict: true` - Enables all strict type checks
- `noUnusedLocals: true` - No unused variables
- `noUnusedParameters: true` - No unused function parameters
- `noImplicitReturns: true` - All code paths must return

## Import Conventions

### Path Alias

Always use the `@/` path alias for imports from `src/`:

```typescript
// ✅ Correct
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';

// ❌ Incorrect
import { prisma } from '../../../lib/prisma';
import { prisma } from 'src/lib/prisma';
```

### Import Order

Organize imports in this order:

1. React/Next.js imports
2. Third-party libraries
3. Internal modules (`@/`)
4. Types (use `type` imports where possible)
5. Relative imports (avoid when `@/` works)

```typescript
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { User } from '@/generated/prisma/client';
```

## Type Definitions

### Prefer Interfaces for Objects

Use `interface` for object shapes, `type` for unions/intersections:

```typescript
// ✅ Object shapes
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// ✅ Unions and computed types
type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';
```

### Extending HTML Elements

When creating components that extend HTML elements, use the native attribute types:

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}
```

### Export Types Separately

Use `type` keyword for type-only exports:

```typescript
export type { UserProfile, ButtonProps };
```

## Null and Undefined Handling

### Avoid Non-Null Assertions

Minimize use of `!` non-null assertions. Prefer proper null checks:

```typescript
// ✅ Preferred
const user = await getUser();
if (!user) {
  throw new Error('User not found');
}
// user is now safely narrowed

// ⚠️ Use sparingly (only when you're certain)
const clientId = process.env.GITHUB_CLIENT_ID!;
```

### Use Optional Chaining

```typescript
// ✅ Correct
const email = profile.email ?? undefined;
const name = user?.profile?.displayName;

// ❌ Avoid
const email = profile.email ? profile.email : undefined;
```

## Function Patterns

### Arrow Functions for Callbacks

```typescript
// ✅ Correct
const users = await Promise.all(ids.map(async (id) => fetchUser(id)));

// ✅ Named functions for exports
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Async/Await Over Promises

```typescript
// ✅ Preferred
async function fetchUserData(id: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  return user;
}

// ❌ Avoid callback chains
function fetchUserData(id: string): Promise<User> {
  return prisma.user.findUnique({ where: { id } }).then((user) => {
    if (!user) throw new Error('User not found');
    return user;
  });
}
```

## React Component Patterns

### Use `forwardRef` for DOM-Forwarding Components

```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return <button ref={ref} className={cn(baseStyles, className)} {...props} />;
  }
);

Button.displayName = 'Button';
```

### Props Destructuring

Destructure props in function parameters with sensible defaults:

```typescript
function Card({ title, children, className = '' }: CardProps) {
  // ...
}
```

### Server vs Client Components

- Default to Server Components (no directive needed)
- Add `'use client'` only when using hooks, event handlers, or browser APIs
- Keep `'use client'` components small and push state down

## Validation with Zod

Use Zod for runtime validation, especially for:

- API request/response bodies
- Form inputs
- Environment variables

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type UserInput = z.infer<typeof UserSchema>;
```

## Error Handling

### Use Typed Errors

```typescript
// Check error type before accessing properties
if (error instanceof Error) {
  console.error(error.message);
}

// For Prisma errors
import { Prisma } from '@/generated/prisma/client';

if (error instanceof Prisma.PrismaClientKnownRequestError) {
  if (error.code === 'P2002') {
    // Handle unique constraint violation
  }
}
```

## Prisma Types

### Import from Generated Client

```typescript
import { prisma } from '@/lib/prisma';
import type { User, Course, Enrollment } from '@/generated/prisma/client';
```

### Use Prisma's Generated Types

```typescript
import { Prisma } from '@/generated/prisma/client';

// For complex queries
type UserWithCourses = Prisma.UserGetPayload<{
  include: { enrollments: { include: { course: true } } };
}>;
```

## Avoid These Patterns

```typescript
// ❌ Don't use `any`
function process(data: any) { ... }

// ✅ Use `unknown` and narrow
function process(data: unknown) {
  if (typeof data === 'string') { ... }
}

// ❌ Don't use `@ts-ignore`
// @ts-ignore
someFunction(wrongArg);

// ✅ Use `@ts-expect-error` with explanation if absolutely necessary
// @ts-expect-error - Third-party types are incorrect
someFunction(correctArg);

// ❌ Don't use `as` for unsafe casts
const user = data as User;

// ✅ Validate and narrow types
const user = UserSchema.parse(data);
```

## Next.js Specific

### API Route Handlers

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Use NextRequest for typed access to searchParams, cookies, etc.
  const searchParams = request.nextUrl.searchParams;

  return NextResponse.json({ data });
}
```

### Server Actions

```typescript
'use server';

export async function createUser(formData: FormData): Promise<{ success: boolean }> {
  // Server action implementation
}
```
