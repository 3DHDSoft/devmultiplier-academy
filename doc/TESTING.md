# Unit Testing Guide

## Overview

This project uses **Vitest 4.x** as the testing framework with TypeScript support. Tests are organized by feature and
include unit tests for utilities, API handlers, authentication, and component logic.

## Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Generate coverage report
bun run test:coverage

# Run tests with UI (interactive)
bun run test:ui
```

## Test Execution Flow

```mermaid
flowchart TD
    A[Run: bun run test] --> B[Vitest loads config]
    B --> C[Setup: vitest.setup.ts]
    C --> D[Discover tests in src/**/*.test.ts]
    D --> E[Run tests in parallel]
    E --> F{All pass?}
    F -->|Yes| G[✅ Tests passed]
    F -->|No| H[❌ Show failures]
    H --> I[Exit code 1]
    G --> J[Exit code 0]

    style A fill:#51cf66,stroke:#2f9e44,color:#fff
    style G fill:#51cf66,stroke:#2f9e44,color:#fff
    style H fill:#ff6b6b,stroke:#c92a2a,color:#fff
```

## Test Structure

Tests are organized in `__tests__` directories alongside the code they test:

```mermaid
graph TD
    Root["src/"] --> Auth["__tests__/"]
    Root --> Lib["lib/"]
    Root --> App["app/"]
    Root --> Components["components/"]

    Auth --> AuthTest["auth.test.ts"]
    Auth --> ModelsTest["models.test.ts"]

    Lib --> LibTests["__tests__/"]
    LibTests --> ApiTest["api.test.ts"]
    LibTests --> UtilsTest["utils.test.ts"]

    App --> AppApi["api/"]
    AppApi --> ApiTests["__tests__/"]
    ApiTests --> CoursesTest["courses.test.ts"]
    ApiTests --> EnrollmentsTest["enrollments.test.ts"]
    ApiTests --> ProgressTest["progress.test.ts"]
    ApiTests --> RegisterTest["register.test.ts"]
    ApiTests --> LanguageTest["user-language.test.ts"]
    ApiTests --> ProfileTest["user-profile.test.ts"]

    Components --> UI["ui/"]
    UI --> UiTests["__tests__/"]
    UiTests --> ButtonTest["button.test.tsx"]

    style AuthTest fill:#a3e4d7,stroke:#1abc9c
    style ModelsTest fill:#a3e4d7,stroke:#1abc9c
    style ApiTest fill:#a3e4d7,stroke:#1abc9c
    style UtilsTest fill:#a3e4d7,stroke:#1abc9c
    style CoursesTest fill:#a3e4d7,stroke:#1abc9c
    style EnrollmentsTest fill:#a3e4d7,stroke:#1abc9c
    style ProgressTest fill:#a3e4d7,stroke:#1abc9c
    style RegisterTest fill:#a3e4d7,stroke:#1abc9c
    style LanguageTest fill:#a3e4d7,stroke:#1abc9c
    style ProfileTest fill:#a3e4d7,stroke:#1abc9c
    style ButtonTest fill:#a3e4d7,stroke:#1abc9c
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

### API Routes (`src/app/api/__tests__/`)

- Course CRUD operations
- Enrollment management
- Progress tracking
- User registration
- Language preferences
- Profile management

### Components (`src/components/ui/__tests__/button.test.tsx`)

- Button variant types
- Size options
- Disabled state support

## Configuration

- **vitest.config.mjs** - Main Vitest configuration
- **vitest.setup.ts** - Test environment setup with mocks for Next.js APIs

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest';

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
import { vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
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

Ensure `vitest.config.mjs` includes proper TypeScript configuration and all required type definitions are installed.

### Module Resolution Issues

Check that the path aliases in `vitest.config.mjs` match your path aliases in `tsconfig.json`.

### Missing Test Dependencies

Install missing test utilities:

```bash
bun add -d @testing-library/react @testing-library/jest-dom
```

## Future Enhancements

- [ ] Set up coverage thresholds
- [ ] Add snapshot tests for UI components
- [ ] Configure pre-commit git hooks to run tests

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
