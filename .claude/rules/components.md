# Components Rules

These rules apply to all React components in `src/components/`.

## Component Structure

```
📦 src/components/
├── 📁 ui/                    # Reusable UI primitives
│   ├── 🧩 Button.tsx
│   ├── 🧩 Card.tsx
│   └── 📁 __tests__/
├── 📁 layout/                # Layout components
│   ├── 🧩 Header.tsx
│   └── 🧩 Footer.tsx
└── 📁 sections/              # Page sections
    ├── 🧩 Hero.tsx
    └── 🧩 Pricing.tsx
```

## Server vs Client Components

### Server Components (Default)

No directive needed. Use for:
- Data fetching
- Backend access
- Static content
- SEO-critical content

```typescript
// No directive - Server Component by default
export default async function CourseList() {
  const courses = await getCourses();
  return <ul>{courses.map(c => <li key={c.id}>{c.title}</li>)}</ul>;
}
```

### Client Components

Add `'use client'` directive. Use for:
- Event handlers (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs
- Interactive UI

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Component Template

### UI Component with forwardRef

```typescript
import { cn } from '@/lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg p-4',
          {
            'bg-white shadow': variant === 'default',
            'border border-gray-200': variant === 'outlined',
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

Card.displayName = 'Card';

export { Card };
```

### Interactive Component

```typescript
'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          'rounded-lg px-4 py-2 font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
          },
          className
        )}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

## Styling with Tailwind

### Use cn() Helper

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  className // Allow override
)} />
```

### Responsive Design

```typescript
<div className="
  grid grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
">
```

### Variant Patterns

```typescript
const variants = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-100 text-gray-900',
};

<div className={cn(variants[variant], className)} />
```

## Props Guidelines

### Use Interface Extension

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}
```

### Destructure with Defaults

```typescript
function Card({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: CardProps) {
```

### Spread Remaining Props

```typescript
<div {...props}>{children}</div>
```

## Accessibility

### Required Attributes

```typescript
// Buttons with icons need labels
<button aria-label="Close dialog">
  <X />
</button>

// Form inputs need labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Error states
<input
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && <p id="email-error" role="alert">{error}</p>}
```

### Focus Management

```typescript
// Visible focus states
className="focus:outline-none focus:ring-2 focus:ring-blue-500"

// Skip link
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Best Practices

### Do

- Use Server Components by default
- Add `'use client'` only when needed
- Use `forwardRef` for DOM-forwarding components
- Set `displayName` for debugging
- Use `cn()` for class merging
- Include accessible attributes
- Keep components focused and composable

### Don't

- Don't use `'use client'` unnecessarily
- Don't use inline styles (use Tailwind)
- Don't create deeply nested components
- Don't skip TypeScript types
- Don't ignore accessibility
- Don't forget displayName for forwardRef
