# API Routes Rules

These rules apply to all API route handlers in `src/app/api/`.

## File Structure

```
📦 src/app/api/
├── 📁 [resource]/
│   ├── 📄 route.ts           # GET (list), POST (create)
│   └── 📁 [id]/
│       └── 📄 route.ts       # GET, PUT, DELETE (single)
```

## Route Handler Template

```typescript
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function METHOD(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validation
    // 3. Authorization
    // 4. Business Logic
    // 5. Response

  } catch (error) {
    // Error handling
  }
}
```

## Authentication

Always check authentication first for protected routes:

```typescript
const session = await auth();
if (!session?.user?.id) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Authorization

Verify users can only access their own data:

```typescript
// ✅ Correct - verify ownership
const resource = await prisma.resource.findUnique({ where: { id } });
if (resource?.userId !== session.user.id) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

// ❌ Wrong - no authorization check
const resource = await prisma.resource.findUnique({ where: { id } });
return Response.json({ data: resource });
```

## Input Validation

Always validate with Zod before using input:

```typescript
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const body = await request.json();
const validated = schema.parse(body);
```

## Query Parameters

```typescript
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const { searchParams } = new URL(request.url);
const query = querySchema.parse(Object.fromEntries(searchParams));
```

## Response Format

### Success Responses

```typescript
// Single resource
return Response.json({ data: resource });

// List with pagination
return Response.json({
  data: resources,
  meta: { page, limit, total, totalPages }
});

// Created
return Response.json({ data: resource }, { status: 201 });

// No content
return new Response(null, { status: 204 });
```

### Error Responses

```typescript
// 400 Bad Request
return Response.json({
  error: 'Validation failed',
  details: zodError.errors
}, { status: 400 });

// 401 Unauthorized
return Response.json({ error: 'Unauthorized' }, { status: 401 });

// 403 Forbidden
return Response.json({ error: 'Forbidden' }, { status: 403 });

// 404 Not Found
return Response.json({ error: 'Not found' }, { status: 404 });

// 500 Internal Server Error
return Response.json({ error: 'Internal server error' }, { status: 500 });
```

## Error Handling

```typescript
try {
  // Route logic
} catch (error) {
  if (error instanceof z.ZodError) {
    return Response.json({
      error: 'Validation failed',
      details: error.errors
    }, { status: 400 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
  }

  console.error('API error:', error);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
```

## Dynamic Route Parameters

```typescript
type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  // Use id
}
```

## Best Practices

### Do

- Always authenticate before accessing data
- Always authorize before returning/modifying data
- Always validate input with Zod
- Use meaningful HTTP status codes
- Log errors server-side
- Return generic error messages to clients

### Don't

- Don't trust user input without validation
- Don't expose internal error details
- Don't return data without authorization checks
- Don't use `any` types
- Don't skip error handling
