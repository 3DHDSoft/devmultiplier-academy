# Testing Rules

These rules apply to all test files in this project.

## Test Commands

```bash
bun test                              # Run unit tests (Vitest)
bun test src/lib/__tests__/utils.test.ts  # Run single test file
bun run test:watch                    # Watch mode
bun run test:coverage                 # Coverage report
bun run e2e                           # Playwright e2e tests
bun run e2e:headed                    # E2e with visible browser
```

## Test Structure

### File Organization

Place unit tests in `__tests__` directories adjacent to the code:

```
src/
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── __tests__/
│           └── button.test.tsx
└── app/
    └── api/
        └── __tests__/
            └── courses.test.ts
```

E2E tests go in the `e2e/` directory at project root.

### File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`

## Unit Tests (Vitest)

### Basic Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = someFunction(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Test Naming Conventions

Use descriptive "should..." format:

```typescript
// ✅ Good - describes behavior
it('should return empty array when no items match filter', () => {});
it('should throw error for invalid email format', () => {});

// ❌ Bad - vague or implementation-focused
it('works', () => {});
it('test filter function', () => {});
```

### Mocking

Use `vi.mock()` for module mocks. Global mocks are in `vitest.setup.ts`:

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock a function return value
import { prisma } from '@/lib/prisma';
vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', name: 'Test' });

// Clear mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
```

### Pre-Configured Mocks

These are already mocked in `vitest.setup.ts`:

- `next/navigation` (useRouter, usePathname, useSearchParams, useParams)
- `next-auth` and `next-auth/react`
- `@/lib/prisma`

### Async Testing

```typescript
it('should fetch user data', async () => {
  const user = await fetchUser('123');
  expect(user).toBeDefined();
  expect(user.id).toBe('123');
});

// Testing rejected promises
it('should throw on invalid id', async () => {
  await expect(fetchUser('invalid')).rejects.toThrow('User not found');
});
```

### Testing Zod Schemas

```typescript
import { z } from 'zod';

describe('validation schema', () => {
  const schema = z.object({
    email: z.string().email(),
    page: z.coerce.number().min(1).default(1),
  });

  it('should parse valid input', () => {
    const result = schema.safeParse({ email: 'test@example.com', page: '2' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ email: 'test@example.com', page: 2 });
  });

  it('should reject invalid input', () => {
    const result = schema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
  });
});
```

## Component Testing

### With React Testing Library

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Query Priority

Prefer accessible queries in this order:

1. `getByRole` - Best for accessibility
2. `getByLabelText` - For form elements
3. `getByPlaceholderText` - Form inputs
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort

```typescript
// ✅ Preferred - uses role
screen.getByRole('button', { name: /submit/i });

// ✅ Good - for form fields
screen.getByLabelText(/email/i);

// ⚠️ Avoid unless necessary
screen.getByTestId('submit-button');
```

## E2E Tests (Playwright)

### Basic Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user flow', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/DevMultiplier/);
  });
});
```

### Locator Strategies

Prefer user-facing locators:

```typescript
// ✅ Best - role-based
await page.getByRole('button', { name: /sign in/i }).click();

// ✅ Good - label-based for forms
await page.getByLabel(/email/i).fill('test@example.com');

// ✅ Acceptable - type-based
const emailInput = page.locator('input[type="email"]');

// ⚠️ Last resort - test IDs
await page.getByTestId('submit-button').click();
```

### Common Patterns

```typescript
test.describe('Authentication', () => {
  test('login page has required inputs', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');

    await emailInput.fill('invalid-email');

    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.checkValidity()
    );
    expect(isInvalid).toBe(true);
  });
});
```

### Waiting for Elements

```typescript
// Wait for element to be visible
await expect(page.getByText('Success')).toBeVisible();

// Wait for URL change
await expect(page).toHaveURL('/dashboard');

// Wait with timeout
await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
```

## Coverage Requirements

The project enforces 70% coverage thresholds:

```javascript
// vitest.config.mjs
coverage: {
  lines: 70,
  functions: 70,
  branches: 70,
  statements: 70,
}
```

Run coverage report:

```bash
bun run test:coverage
```

## Best Practices

### Do

- Test behavior, not implementation details
- Use descriptive test names with "should..."
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests independent and isolated
- Mock external dependencies
- Test edge cases and error conditions
- Prefer role-based queries for accessibility

### Don't

- Don't test third-party library internals
- Don't share state between tests
- Don't use `test.only` in committed code
- Don't hardcode timeouts when waits exist
- Don't test implementation details
- Don't write brittle selectors (prefer roles over CSS classes)

### Test Independence

```typescript
// ✅ Each test is self-contained
describe('UserService', () => {
  it('should create user', async () => {
    const user = await createUser({ name: 'Test' });
    expect(user.id).toBeDefined();
  });

  it('should find user by id', async () => {
    // Don't rely on previous test - create own data
    const created = await createUser({ name: 'Find Test' });
    const found = await findUser(created.id);
    expect(found.name).toBe('Find Test');
  });
});
```

## API Route Testing Pattern

Test API handlers by testing their logic components:

```typescript
describe('GET /api/courses', () => {
  describe('query parameters', () => {
    it('should validate pagination parameters', () => {
      const pageSchema = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
      });

      const result = pageSchema.safeParse({ page: '2', limit: '50' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ page: 2, limit: 50 });
    });
  });

  describe('response format', () => {
    it('should format course with translation fallbacks', () => {
      const rawCourse = {
        id: '123',
        translations: [{ title: 'DDD Course' }],
      };

      const title = rawCourse.translations[0]?.title || 'Untitled';
      expect(title).toBe('DDD Course');
    });
  });
});
```

## Debugging Tests

### Unit Tests

```bash
# Run with verbose output
bun test --reporter=verbose

# Run specific test file
bun test src/lib/__tests__/utils.test.ts

# Run tests matching pattern
bun test -t "should validate"
```

### E2E Tests

```bash
# Run with visible browser
bun run e2e:headed

# Debug mode (pauses on failure)
bun run e2e -- --debug

# Generate trace for failed tests
bun run e2e -- --trace on
```

## Environment

- **Test runner**: Vitest 4.x
- **DOM environment**: happy-dom
- **Component testing**: React Testing Library
- **E2E testing**: Playwright
- **Assertions**: Vitest expect + @testing-library/jest-dom
