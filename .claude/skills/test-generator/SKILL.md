# Test Generator Skill

Generate comprehensive tests for existing code.

## Description

This skill analyzes existing code and generates appropriate unit tests, integration tests, and E2E tests following project conventions.

## Triggers

Activate this skill when:
- User asks to "write tests for [file/feature]"
- User asks to "generate tests"
- User asks to "add test coverage"
- User mentions "testing" for existing code

## Instructions

### Step 1: Analyze Target Code

```bash
# Read the file to test
cat src/[path]/[file].ts

# Check for existing tests
ls src/[path]/__tests__/ 2>/dev/null || echo "No tests directory"

# Check test patterns used in project
grep -r "describe\|it\|test" src --include="*.test.ts" -l | head -5
```

### Step 2: Determine Test Type

| Code Type | Test Type | Location |
|-----------|-----------|----------|
| Utility function | Unit test | `src/lib/__tests__/` |
| React component | Component test | `src/components/**/__tests__/` |
| API route | Integration test | `src/app/api/__tests__/` |
| User flow | E2E test | `e2e/` |
| Hook | Hook test | `src/hooks/__tests__/` |

### Step 3: Generate Unit Tests

#### For Utility Functions

```typescript
// src/lib/__tests__/[function].test.ts
import { describe, it, expect } from 'vitest';
import { functionName } from '../[file]';

describe('functionName', () => {
  describe('happy path', () => {
    it('should return expected result for valid input', () => {
      const result = functionName('valid input');
      expect(result).toBe('expected output');
    });

    it('should handle multiple valid inputs', () => {
      const testCases = [
        { input: 'a', expected: 'A' },
        { input: 'b', expected: 'B' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(functionName(input)).toBe(expected);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      expect(functionName('')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(functionName(null)).toBeNull();
      expect(functionName(undefined)).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw for invalid input', () => {
      expect(() => functionName('invalid')).toThrow('Error message');
    });
  });
});
```

#### For Async Functions

```typescript
import { describe, it, expect, vi } from 'vitest';
import { asyncFunction } from '../[file]';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    model: {
      findUnique: vi.fn(),
    },
  },
}));

describe('asyncFunction', () => {
  it('should resolve with data on success', async () => {
    const mockData = { id: '1', name: 'Test' };
    vi.mocked(prisma.model.findUnique).mockResolvedValue(mockData);

    const result = await asyncFunction('1');

    expect(result).toEqual(mockData);
    expect(prisma.model.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it('should throw on not found', async () => {
    vi.mocked(prisma.model.findUnique).mockResolvedValue(null);

    await expect(asyncFunction('invalid')).rejects.toThrow('Not found');
  });

  it('should propagate database errors', async () => {
    vi.mocked(prisma.model.findUnique).mockRejectedValue(new Error('DB error'));

    await expect(asyncFunction('1')).rejects.toThrow('DB error');
  });
});
```

### Step 4: Generate Component Tests

```typescript
// src/components/[Component]/__tests__/[Component].test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  // Rendering tests
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<ComponentName />);
      expect(screen.getByRole('...')).toBeInTheDocument();
    });

    it('renders with required props', () => {
      render(<ComponentName title="Test" />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<ComponentName>Child content</ComponentName>);
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  // Variant tests
  describe('variants', () => {
    it('applies primary variant styles', () => {
      render(<ComponentName variant="primary" />);
      expect(screen.getByRole('...')).toHaveClass('bg-blue-600');
    });
  });

  // Interaction tests
  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ComponentName onClick={handleClick} />);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<ComponentName onSubmit={handleSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
      });
    });
  });

  // State tests
  describe('state management', () => {
    it('shows loading state', () => {
      render(<ComponentName isLoading />);
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('shows error state', () => {
      render(<ComponentName error="Something went wrong" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    });
  });

  // Accessibility tests
  describe('accessibility', () => {
    it('has accessible name', () => {
      render(<ComponentName aria-label="Test component" />);
      expect(screen.getByLabelText('Test component')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ComponentName />);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });
  });
});
```

### Step 5: Generate API Route Tests

```typescript
// src/app/api/__tests__/[route].test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    model: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

describe('API: /api/[route]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 without authentication', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      // Test logic
    });

    it('returns paginated data', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-1' },
      });
      vi.mocked(prisma.model.findMany).mockResolvedValue([
        { id: '1', name: 'Test' },
      ]);

      // Test logic
    });
  });

  describe('POST', () => {
    it('creates resource with valid data', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-1' },
      });

      const schema = z.object({
        name: z.string().min(1),
      });

      const result = schema.safeParse({ name: 'Test' });
      expect(result.success).toBe(true);
    });

    it('returns 400 for invalid data', async () => {
      const schema = z.object({
        name: z.string().min(1),
      });

      const result = schema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });
  });
});
```

### Step 6: Generate E2E Tests

```typescript
// e2e/[feature].spec.ts
import { test, expect } from '@playwright/test';

test.describe('[Feature Name]', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login, navigate, etc.
    await page.goto('/');
  });

  test('completes happy path flow', async ({ page }) => {
    // Step 1
    await page.getByRole('link', { name: /feature/i }).click();
    await expect(page).toHaveURL('/feature');

    // Step 2
    await page.getByLabel(/input/i).fill('test value');
    await page.getByRole('button', { name: /submit/i }).click();

    // Verify
    await expect(page.getByText(/success/i)).toBeVisible();
  });

  test('handles errors gracefully', async ({ page }) => {
    // Trigger error condition
    await page.getByRole('button', { name: /submit/i }).click();

    // Verify error handling
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('is accessible', async ({ page }) => {
    await page.goto('/feature');

    // Basic accessibility check
    const accessibilityTree = await page.accessibility.snapshot();
    expect(accessibilityTree).toBeTruthy();
  });
});
```

## Output Format

```markdown
## Generated Tests: [File/Feature]

### Files Created

| File | Type | Tests |
|------|------|-------|
| `src/lib/__tests__/[file].test.ts` | Unit | 8 |
| `src/components/__tests__/[Component].test.tsx` | Component | 12 |
| `e2e/[feature].spec.ts` | E2E | 3 |

### Coverage

| Category | Tests | Scenarios Covered |
|----------|-------|-------------------|
| Happy path | 5 | Normal operation |
| Edge cases | 4 | Empty, null, boundary |
| Error handling | 3 | Validation, exceptions |
| Accessibility | 2 | Keyboard, ARIA |

### Run Tests

```bash
# Run new tests
bun test [file]

# Run with coverage
bun run test:coverage

# Run E2E
bun run e2e [feature]
```

### Next Steps

1. [ ] Review generated tests
2. [ ] Add additional edge cases
3. [ ] Run and verify passing
4. [ ] Check coverage report
```

## Tools Available

- `Read` - View source code to test
- `Write` - Create test files
- `Bash` - Run tests
- `Grep` - Find patterns to test
