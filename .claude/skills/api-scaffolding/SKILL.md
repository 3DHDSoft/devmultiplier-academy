# API Scaffolding Skill

Generate complete CRUD API routes from database schema or specifications.

## Description

This skill generates production-ready Next.js API route handlers with proper authentication, validation, error handling, and TypeScript types based on Prisma models.

## Triggers

Activate this skill when:
- User asks to "create API for [resource]"
- User asks to "scaffold CRUD endpoints"
- User asks to "generate API routes"
- User wants to add new API functionality

## Instructions

### Step 1: Identify the Resource

Determine the Prisma model to scaffold:

```bash
# View available models
grep "^model" prisma/schema.prisma
```

### Step 2: Generate Route Structure

Create the following file structure:

```
📦 src/app/api/
└── 📁 [resource]/
    ├── 📄 route.ts           # GET (list), POST (create)
    └── 📁 [id]/
        └── 📄 route.ts       # GET, PUT, DELETE (single)
```

### Step 3: Generate List/Create Route

```typescript
// src/app/api/[resource]/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createSchema = z.object({
  // Define based on model fields
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  // Add filters as needed
});

// GET /api/[resource] - List resources
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const [data, total] = await Promise.all([
      prisma.[model].findMany({
        where: { userId: session.user.id },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.[model].count({
        where: { userId: session.user.id },
      }),
    ]);

    return Response.json({
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }
    console.error('GET /api/[resource] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/[resource] - Create resource
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createSchema.parse(body);

    const resource = await prisma.[model].create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    });

    return Response.json({ data: resource }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('POST /api/[resource] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Step 4: Generate Single Resource Route

```typescript
// src/app/api/[resource]/[id]/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  // Define updatable fields
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/[resource]/[id] - Get single resource
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const resource = await prisma.[model].findUnique({
      where: { id },
    });

    if (!resource) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Authorization check
    if (resource.userId !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return Response.json({ data: resource });
  } catch (error) {
    console.error('GET /api/[resource]/[id] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/[resource]/[id] - Update resource
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.[model].findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const resource = await prisma.[model].update({
      where: { id },
      data: validated,
    });

    return Response.json({ data: resource });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('PUT /api/[resource]/[id] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/[resource]/[id] - Delete resource
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.[model].findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.[model].delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/[resource]/[id] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Step 5: Generate Tests

```typescript
// src/app/api/__tests__/[resource].test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

describe('[Resource] API', () => {
  describe('GET /api/[resource]', () => {
    it('should return 401 without authentication', () => {
      // Test implementation
    });

    it('should return paginated results', () => {
      // Test implementation
    });
  });

  describe('POST /api/[resource]', () => {
    it('should create resource with valid data', () => {
      // Test implementation
    });

    it('should return 400 for invalid data', () => {
      // Test implementation
    });
  });

  // Additional tests...
});
```

## Output Format

```markdown
## Generated API: [Resource]

### Files Created

| File | Purpose |
|------|---------|
| `src/app/api/[resource]/route.ts` | List & Create |
| `src/app/api/[resource]/[id]/route.ts` | Get, Update, Delete |
| `src/app/api/__tests__/[resource].test.ts` | Unit tests |

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/[resource]` | List with pagination |
| POST | `/api/[resource]` | Create new |
| GET | `/api/[resource]/[id]` | Get by ID |
| PUT | `/api/[resource]/[id]` | Update by ID |
| DELETE | `/api/[resource]/[id]` | Delete by ID |

### Validation Schema

```typescript
const createSchema = z.object({
  // Generated from model
});
```

### Next Steps

1. [ ] Review generated code
2. [ ] Customize validation rules
3. [ ] Add business logic
4. [ ] Run tests
5. [ ] Update API documentation
```

## Tools Available

- `Read` - View Prisma schema
- `Write` - Create route files
- `Glob` - Find existing routes
- `Bash` - Run tests
