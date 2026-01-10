# Security Rules

These rules apply to all code to ensure application security.

## Authentication

### Always Verify Authentication

```typescript
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Authenticated user available
}
```

### Protected Routes

Routes in `(protected)/` require authentication. Middleware checks session:

```typescript
// middleware.ts
const protectedRoutes = ['/dashboard', '/courses', '/profile', '/enrollments'];
```

## Authorization

### Verify Resource Ownership

```typescript
// ✅ Always verify user owns the resource
const resource = await prisma.resource.findUnique({
  where: { id: resourceId },
});

if (resource?.userId !== session.user.id) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

// ❌ Never trust user-provided IDs without verification
```

### Use Session User ID for Writes

```typescript
// ✅ Correct - use authenticated user ID
await prisma.enrollments.create({
  data: {
    userId: session.user.id, // From session
    courseId: body.courseId,
  },
});

// ❌ Wrong - user could impersonate others
await prisma.enrollments.create({
  data: {
    userId: body.userId, // From user input
    courseId: body.courseId,
  },
});
```

## Input Validation

### Always Validate with Zod

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

const body = await request.json();
const validated = schema.parse(body); // Throws on invalid
```

### Sanitize User Input

```typescript
// Validate types and constraints
const schema = z.object({
  page: z.coerce.number().min(1).max(1000),
  limit: z.coerce.number().min(1).max(100),
  search: z.string().max(200).optional(),
});
```

## SQL Injection Prevention

### Use Prisma (Parameterized Queries)

```typescript
// ✅ Safe - Prisma parameterizes automatically
await prisma.users.findUnique({
  where: { email: userInput },
});

// ❌ Never concatenate user input in raw SQL
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`; // Safe
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${userInput}'`); // DANGEROUS
```

## XSS Prevention

### React Auto-Escapes

```typescript
// ✅ Safe - React escapes by default
<p>{userContent}</p>

// ❌ Dangerous - renders raw HTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

### If HTML is Required

```typescript
import DOMPurify from 'dompurify';

// Sanitize before rendering
const sanitized = DOMPurify.sanitize(userContent);
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

## Secrets Management

### Environment Variables

```typescript
// ✅ Access via process.env
const secret = process.env.NEXTAUTH_SECRET;

// ❌ Never hardcode secrets
const secret = 'my-secret-key';
```

### Never Expose Secrets

```typescript
// ✅ Server-side only
// Secret stays on server

// ❌ Never expose to client
// NEXT_PUBLIC_* are exposed to browser
```

### Git Ignore

```gitignore
.env
.env.local
.env.*.local
```

## Password Security

### Hash Passwords

```typescript
import bcrypt from 'bcryptjs';

// Hash before storing
const hashedPassword = await bcrypt.hash(password, 10);

// Compare on login
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### Never Log Passwords

```typescript
// ❌ Never log sensitive data
console.log('User:', { email, password });

// ✅ Redact sensitive fields
console.log('User:', { email, password: '[REDACTED]' });
```

## Error Handling

### Don't Expose Internal Details

```typescript
// ✅ Generic error to client
return Response.json({ error: 'Internal server error' }, { status: 500 });

// Log details server-side
console.error('Database error:', error);

// ❌ Never expose stack traces
return Response.json({
  error: error.message,
  stack: error.stack
}, { status: 500 });
```

## Rate Limiting

### Protect Sensitive Endpoints

```typescript
// For auth endpoints, consider rate limiting:
// - Login attempts
// - Password reset requests
// - Registration

// Use middleware or external service
```

## Security Headers

### Recommended Headers

```typescript
// next.config.ts headers
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN'
},
{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
},
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin'
},
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains'
}
```

## Checklist

### Before Commit

- [ ] No hardcoded secrets
- [ ] All user input validated
- [ ] Authentication checked on protected routes
- [ ] Authorization verified for resource access
- [ ] No sensitive data in error responses
- [ ] No dangerouslySetInnerHTML with user content
- [ ] Passwords hashed before storage

### Code Review

- [ ] Verify auth checks
- [ ] Verify authorization logic
- [ ] Check for input validation
- [ ] Look for potential injection points
- [ ] Ensure error messages are safe
