# Component Generator Skill

Generate React components with TypeScript, tests, and documentation.

## Description

This skill generates production-ready React components following project conventions, including proper TypeScript types, Tailwind styling, accessibility, and unit tests.

## Triggers

Activate this skill when:
- User asks to "create component"
- User asks to "generate a [component type]"
- User asks to "scaffold UI component"
- User needs a new reusable component

## Instructions

### Step 1: Determine Component Type

| Type | Location | Characteristics |
|------|----------|-----------------|
| UI | `src/components/ui/` | Reusable, no business logic |
| Layout | `src/components/layout/` | Page structure |
| Section | `src/components/sections/` | Page sections |
| Feature | `src/components/[feature]/` | Feature-specific |

### Step 2: Generate Component File

#### Basic UI Component

```typescript
// src/components/ui/[Component].tsx
import { cn } from '@/lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';

export interface [Component]Props extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const [Component] = forwardRef<HTMLDivElement, [Component]Props>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg transition-colors',
          // Variant styles
          {
            'bg-white border border-gray-200': variant === 'default',
            'bg-blue-600 text-white': variant === 'primary',
            'bg-gray-100 text-gray-900': variant === 'secondary',
          },
          // Size styles
          {
            'p-3 text-sm': size === 'sm',
            'p-4 text-base': size === 'md',
            'p-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

[Component].displayName = '[Component]';

export { [Component] };
```

#### Interactive Component (Client)

```typescript
// src/components/ui/[Component].tsx
'use client';

import { cn } from '@/lib/utils';
import { forwardRef, useState, type ButtonHTMLAttributes } from 'react';

export interface [Component]Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'destructive';
  isLoading?: boolean;
}

const [Component] = forwardRef<HTMLButtonElement, [Component]Props>(
  ({ className, variant = 'default', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-white border border-gray-300 hover:bg-gray-50': variant === 'default',
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'destructive',
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

[Component].displayName = '[Component]';

export { [Component] };
```

#### Form Component

```typescript
// src/components/ui/[Component].tsx
'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

export interface [Component]Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const [Component] = forwardRef<HTMLInputElement, [Component]Props>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'block w-full rounded-md border px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

[Component].displayName = '[Component]';

export { [Component] };
```

### Step 3: Generate Test File

```typescript
// src/components/ui/__tests__/[component].test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [Component] } from '../[Component]';

describe('[Component]', () => {
  it('renders with default props', () => {
    render(<[Component]>Content</[Component]>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<[Component] variant="primary">Content</[Component]>);
    const element = screen.getByText('Content');
    expect(element).toHaveClass('bg-blue-600');
  });

  it('applies size classes', () => {
    render(<[Component] size="lg">Content</[Component]>);
    const element = screen.getByText('Content');
    expect(element).toHaveClass('p-6');
  });

  it('merges custom className', () => {
    render(<[Component] className="custom-class">Content</[Component]>);
    const element = screen.getByText('Content');
    expect(element).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<[Component] ref={ref}>Content</[Component]>);
    expect(ref).toHaveBeenCalled();
  });

  // For interactive components
  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<[Component] onClick={handleClick}>Click me</[Component]>);
    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<[Component] disabled>Content</[Component]>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  // For form components
  it('shows error message', () => {
    render(<[Component] label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});
```

### Step 4: Update Exports (if needed)

```typescript
// src/components/ui/index.ts
export { [Component] } from './[Component]';
export type { [Component]Props } from './[Component]';
```

## Output Format

```markdown
## Generated Component: [Component]

### Files Created

| File | Purpose |
|------|---------|
| `src/components/ui/[Component].tsx` | Component implementation |
| `src/components/ui/__tests__/[component].test.tsx` | Unit tests |

### Usage

```tsx
import { [Component] } from '@/components/ui/[Component]';

// Default
<[Component]>Content</[Component]>

// With variants
<[Component] variant="primary" size="lg">
  Content
</[Component]>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'secondary'` | `'default'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `className` | `string` | - | Additional CSS classes |

### Accessibility

- [x] Keyboard navigable
- [x] Focus visible
- [x] ARIA attributes
- [x] Color contrast

### Next Steps

1. [ ] Review generated code
2. [ ] Customize styling
3. [ ] Run tests: `bun test [component]`
4. [ ] Add to Storybook (if applicable)
```

## Tools Available

- `Read` - View existing components
- `Write` - Create component files
- `Glob` - Find related components
- `Bash` - Run tests
