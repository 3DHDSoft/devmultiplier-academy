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
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#e2e8f0',
  'primaryTextColor': '#1e293b',
  'primaryBorderColor': '#cbd5e1',
  'lineColor': '#94a3b8',
  'secondaryColor': '#f1f5f9',
  'tertiaryColor': '#f8fafc',
  'background': '#ffffff',
  'textColor': '#334155',
  'fontFamily': 'system-ui, -apple-system, sans-serif'
}}}%%flowchart TD
    A[Run: bun run test] --> B[Vitest loads config]
    B --> C[Setup: vitest.setup.ts]
    C --> D[Discover tests in src/**/*.test.ts]
    D --> E[Run tests in parallel]
    E --> F{All pass?}
    F -->|Yes| G[✅ Tests passed]
    F -->|No| H[❌ Show failures]
    H --> I[Exit code 1]
    G --> J[Exit code 0]

    style A fill:#dcfce7,stroke:#86efac,color:#166534
    style G fill:#dcfce7,stroke:#86efac,color:#166534
    style H fill:#fee2e2,stroke:#fca5a5,color:#991b1b
```

## Test Structure

Tests are organized in `__tests__` directories alongside the code they test:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#e2e8f0',
  'primaryTextColor': '#1e293b',
  'primaryBorderColor': '#cbd5e1',
  'lineColor': '#94a3b8',
  'secondaryColor': '#f1f5f9',
  'tertiaryColor': '#f8fafc',
  'background': '#ffffff',
  'textColor': '#334155',
  'fontFamily': 'system-ui, -apple-system, sans-serif'
}}}%%graph TD
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

    style AuthTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style ModelsTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style ApiTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style UtilsTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style CoursesTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style EnrollmentsTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style ProgressTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style RegisterTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style LanguageTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style ProfileTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    style ButtonTest fill:#dbeafe,stroke:#93c5fd,color:#1e40af
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
