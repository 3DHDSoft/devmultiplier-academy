# Unit Testing Guide

## Overview

This project uses **Jest** as the testing framework with TypeScript support via SWC. Tests are organized by feature and
include unit tests for utilities, API handlers, authentication, and component logic.

## Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Generate coverage report
bun run test:coverage
```

## Test Structure

Tests are organized in `__tests__` directories alongside the code they test:

```
src/
├── __tests__/
│   ├── auth.test.ts          # Authentication schema validation
│   └── models.test.ts        # Data model tests
├── lib/
│   └── __tests__/
│       ├── api.test.ts       # API utilities and data transformation
│       └── utils.test.ts     # General utility functions
└── components/
    └── ui/
        └── __tests__/
            └── button.test.tsx  # Component logic tests
```

## Test Coverage

Current test coverage includes:

### Authentication (`src/__tests__/auth.test.ts`)

- Email validation
- Password validation (8+ character requirement)
- Schema parsing and error handling

### Data Models (`src/__tests__/models.test.ts`)

- Course model structure
- User model with locale/timezone
- Enrollment progress tracking
- Course progress calculations

### API Utilities (`src/lib/__tests__/api.test.ts`)

- HTTP response handling (200, 400, 401, 500)
- Course data transformation
- Enrollment data transformation

### Components (`src/components/ui/__tests__/button.test.tsx`)

- Button variant types
- Size options
- Disabled state support

## Configuration

- **jest.config.ts** - Main Jest configuration
- **jest.setup.ts** - Test environment setup with mocks for Next.js APIs

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Feature Name', () => {
  it('should do something', () => {
    const result = someFunction();
    expect(result).toBe(expectedValue);
  });
});
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Mocking Dependencies

```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));
```

## Best Practices

1. **One assertion per test** - Keep tests focused and simple
2. **Descriptive test names** - Use "should..." format
3. **Test behavior, not implementation** - Focus on outputs, not internal details
4. **Isolate tests** - Use mocks and setUp/tearDown when needed
5. **Keep tests maintainable** - Use helper functions for common setup

## Continuous Integration

Tests are automatically run during:

- Local development (can be enforced via git hooks)
- CI/CD pipelines (to be configured)

Add test execution to your CI pipeline:

```yaml
- name: Run Tests
  run: bun run test
```

## Troubleshooting

### TypeScript Errors in Tests

Ensure `jest.config.ts` includes proper TypeScript transform configuration and all required type definitions are
installed.

### Module Resolution Issues

Check that the `moduleNameMapper` in `jest.config.ts` matches your path aliases in `tsconfig.json`.

### Missing Test Dependencies

Install missing test utilities:

```bash
bun add -d @testing-library/react @testing-library/jest-dom
```

## Future Enhancements

- [ ] Add integration tests for API routes
- [ ] Add E2E tests using Playwright or Cypress
- [ ] Set up coverage thresholds
- [ ] Add snapshot tests for UI components
- [ ] Configure pre-commit git hooks to run tests
